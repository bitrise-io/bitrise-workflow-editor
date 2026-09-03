import { Box, Button, Image, Link, Text, useToast } from '@bitrise/bitkit';
import { datadogRum } from '@datadog/browser-rum';
import { PropsWithChildren, useEffect } from 'react';
import { useEventListener } from 'usehooks-ts';

import { trackConfigBranchLoaded } from '@/core/analytics/ConfigManagementAnalytics';
import { initializeBitriseYmlDocument, initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import ConfigLoadTracker from '@/core/utils/ConfigLoadTracker';
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
import { preloadRoutes } from '@/routes';

import bitriseLogo from '../../images/bitrise-logo.svg';
import errorImg from '../../images/error-hairball.svg';

const InitialDataLoader = ({ children }: PropsWithChildren) => {
  const toast = useToast();
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
    // Module-scoped on purpose — see ConfigLoadTracker.
    if (data && ConfigLoadTracker.shouldLoad(requestedBranch)) {
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
            });
          }
        }
      } else if (legacyConfig.data) {
        initializeBitriseYmlDocument(legacyConfig.data);
      }

      if (requestedBranch && configBranch) {
        if (configBranch === requestedBranch) {
          toast({
            status: 'success',
            isClosable: true,
            description: `Configuration is loaded from ${requestedBranch} branch.`,
          });
        } else {
          toast({
            status: 'warning',
            isClosable: true,
            description: `Config unavailable on ${requestedBranch}. Using ${configBranch} (default branch).`,
          });
        }
      }
      ConfigLoadTracker.markLoaded(requestedBranch);
      if (ConfigLoadTracker.claimRoutePreload()) {
        setTimeout(preloadRoutes, 1000);
      }
    }
  }, [data, requestedBranch, toast, isModularEnabled, legacyConfig.data, treeConfig.data, configBranch]);

  useEffect(() => {
    // Module-scoped so a remount can't re-fire this and double-count the branch load.
    if (data && ymlSettings?.usesRepositoryYml && ConfigLoadTracker.claimBranchLoadTracking()) {
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
  return <ConfigLoadingProvider value={!data}>{children}</ConfigLoadingProvider>;
};

export default InitialDataLoader;
