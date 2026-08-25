import { Box, Button, Image, Link, Text, useToast } from '@bitrise/bitkit';
import { datadogRum } from '@datadog/browser-rum';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import { trackConfigBranchLoaded } from '@/core/analytics/ConfigManagementAnalytics';
import { initializeBitriseYmlDocument, initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useGetCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import { useGetCiConfigTree } from '@/hooks/useCiConfigTree';
import useCloseAIDrawer from '@/hooks/useCloseAIDrawer';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useSearchParams from '@/hooks/useSearchParams';
import useYmlHasChanges from '@/hooks/useYmlHasChanges';
import useYmlLanguageServices from '@/hooks/useYmlLanguageServices';
import { ConfigLoadingProvider } from '@/layouts/ConfigLoading.context';
import { deepLinkedEntity, preloadRoutes } from '@/routes';

import bitriseLogo from '../../images/bitrise-logo.svg';
import errorImg from '../../images/error-hairball.svg';

/**
 * Owns the bootstrap: resolves which config endpoint to hit, loads it into `BitriseYmlStore`, and
 * only then lets its children render. Extracted from the app entry point so the mount sequencing it
 * guarantees (children never render against an un-bootstrapped store) is testable.
 */
const InitialDataLoader = ({ children }: PropsWithChildren) => {
  const toast = useToast();
  const isLoaded = useRef(false);
  const isTracked = useRef(false);
  // Two trackers for the same milestone, with different jobs. The ref is the re-entry guard: it's
  // written synchronously, so a StrictMode double-invoke (or any effect re-run) can't bootstrap
  // twice. The state is what CHILDREN observe — only a re-render can reopen the gate below, which a
  // ref alone would never trigger. `null` = nothing bootstrapped yet, distinct from the `undefined`
  // of "no branch requested".
  const loadedBranch = useRef<string | undefined | null>(null);
  const [bootstrappedBranch, setBootstrappedBranch] = useState<string | undefined | null>(null);
  const hasChanges = useYmlHasChanges();
  const [searchParams] = useSearchParams();
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const requestedBranch = isWebsiteMode ? searchParams.branch : undefined;

  const { data: ymlSettings, isPending: isYmlSettingsPending } = useCiConfigSettings();
  useYmlLanguageServices();
  useCloseAIDrawer();

  // Modular editing only makes sense for repo-stored configs (where includes/modules can exist);
  // a Bitrise-stored config can't have modules, so it stays on the legacy single-file flow even
  // with the flag on. In website mode it's ramped behind the LD flag. CLI mode has no LaunchDarkly
  // (and no Bitrise storage), so it's simply on — a non-modular config resolves to a single-node
  // tree, which the editor drives exactly like the single-file flow.
  const isModularFlagEnabled = useFeatureFlag('enable-wfe-modular-yaml-editing');
  const canBeModular = !isWebsiteMode || ymlSettings?.usesRepositoryYml === true;
  const isModularEnabled = canBeModular && (isWebsiteMode ? isModularFlagEnabled : true);

  // In website mode with the flag on, the storage type decides which endpoint to hit, so
  // wait for the settings to resolve before fetching (don't fire the tree query then switch
  // to legacy once it turns out to be Bitrise-stored). Flag off or CLI → decide immediately.
  const isStorageKnown = !(isModularFlagEnabled && isWebsiteMode) || !isYmlSettingsPending;

  const legacyConfig = useGetCiConfig(
    { projectSlug: PageProps.appSlug(), skipValidation: true, branch: requestedBranch },
    { enabled: isStorageKnown && !isModularEnabled },
  );
  const treeConfig = useGetCiConfigTree(
    { projectSlug: PageProps.appSlug(), branch: requestedBranch },
    { enabled: isStorageKnown && isModularEnabled },
  );

  const { data, error, refetch } = isModularEnabled ? treeConfig : legacyConfig;
  const configBranch = isModularEnabled ? treeConfig.data?.branch : legacyConfig.data?.branch;

  // The config is in the store AND it's the one the URL asks for. Both halves matter: `data`
  // arrives a commit before the bootstrap effect runs, and a branch switch invalidates a config
  // that was legitimately bootstrapped for the previous branch.
  const isBootstrapped = Boolean(data) && bootstrappedBranch === requestedBranch;

  useEventListener('beforeunload', (e) => {
    // NOTE: The return is important for the browser to show the dialog
    return RuntimeUtils.isProduction() && hasChanges && e.preventDefault();
  });

  useEventListener('error', (e) => {
    datadogRum.addError(e);
    toast({ duration: null, status: 'error', isClosable: true, description: e.message || 'Unknown error' });
  });

  useEventListener('unhandledrejection', (e) => {
    // Monaco rejects with a benign "Canceled" sentinel when a model is disposed (e.g. tab switch); not a real error.
    const reason = e.reason as { name?: string; message?: string } | undefined;
    if (reason?.name === 'Canceled' || reason?.message === 'Canceled') {
      return;
    }
    datadogRum.addError(e.reason);
    toast({ duration: null, status: 'error', isClosable: true, description: e.reason?.message || 'Unknown error' });
  });

  useEffect(() => {
    if (data && loadedBranch.current !== requestedBranch) {
      if (isModularEnabled) {
        const config = treeConfig.data;
        if (config) {
          if (config.root.includes.length === 0) {
            // No includes → no modules: even with modular enabled, present it as a plain single-file
            // config (no tree/tabs/merged view). Saving still works — it's repo-stored, so the push
            // flow handles the single-file case (`bitriseYml`), and the mode is re-decided per branch.
            initializeBitriseYmlDocument({
              ymlString: config.root.contents,
              version: '',
              branch: config.branch,
              commitSha: config.root.commitSha,
            });
          } else {
            initializeModularConfig({
              root: config.root,
              mergedYml: config.mergedYml,
              branch: config.branch,
              commitSha: config.root.commitSha,
              // Resolved against the whole tree here, before any page reads the config: an entity
              // addressed by the URL may live in an included module, not in the root file. This
              // effect also runs on a branch switch, which re-resolves the link against the newly
              // loaded tree — keeping the user on the module defining the entity they're viewing.
              deepLink: deepLinkedEntity(window.parent.location.hash),
            });
          }
        }
      } else if (legacyConfig.data) {
        initializeBitriseYmlDocument(legacyConfig.data);
      }

      if (requestedBranch) {
        if (configBranch && configBranch === requestedBranch) {
          toast({
            status: 'success',
            isClosable: true,
            description: `Configuration is loaded from ${requestedBranch} branch.`,
          });
        } else if (configBranch && configBranch !== requestedBranch) {
          toast({
            status: 'warning',
            isClosable: true,
            description: `Config unavailable on ${requestedBranch}. Using ${configBranch} (default branch).`,
          });
        }
      }
      loadedBranch.current = requestedBranch;
      if (!isLoaded.current) {
        setTimeout(preloadRoutes, 1000);
        isLoaded.current = true;
      }
      // Last: opens the gate below, so children first render against an initialized store. The
      // extra render this costs IS the fix — tracking this in the ref alone would leave children
      // rendering a commit early, which is the race this replaces. Keep the setState.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBootstrappedBranch(requestedBranch);
    }
  }, [data, requestedBranch, toast, isModularEnabled, legacyConfig.data, treeConfig.data, configBranch]);

  useEffect(() => {
    if (data && ymlSettings?.usesRepositoryYml && !isTracked.current) {
      isTracked.current = true;
      trackConfigBranchLoaded(configBranch);
    }
  }, [data, ymlSettings?.usesRepositoryYml, configBranch]);

  if (error) {
    let detailedErrorMessage = 'Error - Failed to load the bitrise.yml';
    if (error.status) {
      if (error.data?.error_msg) {
        detailedErrorMessage = `${error.status} - ${error.data.error_msg}`;
      } else if (error.statusText) {
        detailedErrorMessage = `${error.status} - ${error.statusText}`;
      }
    }

    return (
      <Box
        px="5%"
        gap="3rem"
        width="100vw"
        height="100vh"
        display="flex"
        marginX="auto"
        alignItems="center"
        backgroundImage="linear-gradient(315deg, var(--colors-purple-30), var(--colors-purple-10))"
      >
        <Box display="flex" flexDir="column" gap="32" textColor="text/on-color" maxWidth="50%">
          <Link href="/" title="Go to Dashboard">
            <Image src={bitriseLogo} />
          </Link>
          <Box>
            <Text size="3" fontFamily="Source Code Pro, monospace" textTransform="uppercase" mb="16">
              {detailedErrorMessage}
            </Text>
            <Text textStyle="heading/h2" fontWeight="bold" fontSize="48" lineHeight="1.2">
              {error?.message}
            </Text>
          </Box>
          <Button alignSelf="start" variant="primary" size="lg" onClick={() => refetch()}>
            Try again
          </Button>
        </Box>
        <Box>
          <Image src={errorImg} />
        </Box>
      </Box>
    );
  }

  // Expose whether the config is still loading (settings check + tree/legacy fetch) so the layout
  // can show the loading state in the content area while keeping the header + navigation visible.
  //
  // Gated on the bootstrap having run, not merely on `data` having arrived. Passive effects run
  // child-first, so routes mounted in the same commit as the effect above would run their own
  // selection effects first — against an empty (or previous branch's) store — and "correct" the
  // URL, stripping an id that only resolves once the config is in the store. Deriving the gate
  // (rather than flipping it from an effect) also closes it in the very render where the requested
  // branch changes, so a branch switch unmounts the routes before they can see the stale config.
  return <ConfigLoadingProvider value={!isBootstrapped}>{children}</ConfigLoadingProvider>;
};

export default InitialDataLoader;
