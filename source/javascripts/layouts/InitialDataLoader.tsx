import { BitkitButton, createBitkitToast } from '@bitrise/bitkit-v2';
import { datadogRum } from '@datadog/browser-rum';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

import { trackConfigBranchLoaded } from '@/core/analytics/ConfigManagementAnalytics';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { initializeBitriseYmlDocument, initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import { isBrowserExtensionError } from '@/core/utils/CommonUtils';
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
import ErrorPage from '@/layouts/ErrorPage';
import { preloadRoutes } from '@/routes';

/**
 * Owns the bootstrap: resolves which config endpoint to hit, loads it into `BitriseYmlStore`, and
 * only then lets its children render. Extracted from the app entry point so the mount sequencing it
 * guarantees (children never render against an un-bootstrapped store) is testable.
 */
const InitialDataLoader = ({ children }: PropsWithChildren) => {
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
    if (isBrowserExtensionError(e)) {
      return;
    }
    datadogRum.addError(e);
    // `critical` already persists until dismissed, which is what the old `duration: null` asked for.
    createBitkitToast({ variant: 'critical', messageText: e.message || 'Unknown error' });
  });

  useEventListener('unhandledrejection', (e) => {
    // Monaco rejects with a benign "Canceled" sentinel when a model is disposed (e.g. tab switch); not a real error.
    const reason = e.reason as { name?: string; message?: string } | undefined;
    if (reason?.name === 'Canceled' || reason?.message === 'Canceled' || isBrowserExtensionError(reason)) {
      return;
    }
    datadogRum.addError(e.reason);
    createBitkitToast({ variant: 'critical', messageText: e.reason?.message || 'Unknown error' });
  });

  useEffect(() => {
    if (!data || loadedBranch.current === requestedBranch) {
      return undefined;
    }

    // Claimed before the bootstrap below, which is async when the merge has to be fetched: a
    // re-render while it's in flight must not start a second bootstrap.
    loadedBranch.current = requestedBranch;
    let cancelled = false;
    let settled = false;

    const openGate = () => {
      if (cancelled) {
        return;
      }
      settled = true;

      if (requestedBranch) {
        if (configBranch && configBranch === requestedBranch) {
          createBitkitToast({
            variant: 'success',
            messageText: `Configuration is loaded from ${requestedBranch} branch.`,
          });
        } else if (configBranch && configBranch !== requestedBranch) {
          createBitkitToast({
            variant: 'warning',
            messageText: `Config unavailable on ${requestedBranch}. Using ${configBranch} (default branch).`,
          });
        }
      }

      if (!isLoaded.current) {
        setTimeout(preloadRoutes, 1000);
        isLoaded.current = true;
      }
      // Last: opens the gate below, so children first render against an initialized store. The
      // extra render this costs IS the fix — tracking this in the ref alone would leave children
      // rendering a commit early, which is the race this replaces. Keep the setState.
      setBootstrappedBranch(requestedBranch);
    };

    // A bootstrap that never reached `openGate` has to hand its claim back, or nothing bootstraps
    // this branch again: StrictMode runs setup → cleanup → setup on mount, so with the tree data
    // already in hand the first pass is cancelled mid-merge while the second sees the claim and
    // returns — leaving the gate shut for good.
    const releaseUnfinishedClaim = () => {
      cancelled = true;
      if (!settled) {
        loadedBranch.current = null;
      }
    };

    const config = isModularEnabled ? treeConfig.data : undefined;

    if (config && config.root.includes.length > 0) {
      const initModular = (mergedYml?: string) => {
        if (cancelled) {
          return;
        }
        initializeModularConfig({
          root: config.root,
          mergedYml,
          branch: config.branch,
          commitSha: config.root.commitSha,
        });
        openGate();
      };

      // An empty merge is a failed merge, not a config that merges to nothing.
      if (config.mergedYml) {
        initModular(config.mergedYml);
        return releaseUnfinishedClaim;
      }

      // Open the root file rather than a merged tab rendering something else, and say so. The tab
      // stays there and re-selecting it retries the merge.
      const failMerge = () => {
        initModular(undefined);
        if (!cancelled) {
          createBitkitToast({
            variant: 'warning',
            messageText: 'Merged configuration is unavailable. Open the Merged config tab to retry.',
          });
        }
      };

      // A modular config opens on the merged view, so the merge has to be in hand before the store
      // is initialized: a page resolving a module's entity against any other document falls back to
      // the wrong one and rewrites the URL (BIVS-3807). The tree endpoint normally carries the
      // merge; when it doesn't, fetch it here, behind this same loading gate.
      BitriseYmlApi.getMergedConfig({
        projectSlug: PageProps.appSlug(),
        tree: config.root,
        branch: config.branch,
      })
        .then(({ mergedYml }) => (mergedYml ? initModular(mergedYml) : failMerge()))
        .catch(failMerge);

      return releaseUnfinishedClaim;
    }

    if (config) {
      // No includes → no modules: even with modular enabled, present it as a plain single-file
      // config (no tree/tabs/merged view). Saving still works — it's repo-stored, so the push
      // flow handles the single-file case (`bitriseYml`), and the mode is re-decided per branch.
      initializeBitriseYmlDocument({
        ymlString: config.root.contents,
        version: '',
        branch: config.branch,
        commitSha: config.root.commitSha,
      });
    } else if (legacyConfig.data) {
      initializeBitriseYmlDocument(legacyConfig.data);
    }

    openGate();
    return releaseUnfinishedClaim;
  }, [data, requestedBranch, isModularEnabled, legacyConfig.data, treeConfig.data, configBranch]);

  useEffect(() => {
    if (data && ymlSettings?.usesRepositoryYml && !isTracked.current) {
      isTracked.current = true;
      trackConfigBranchLoaded(configBranch);
    }
  }, [data, ymlSettings?.usesRepositoryYml, configBranch]);

  if (error) {
    let detailedErrorMessage = 'Error – Failed to load the bitrise.yml';
    if (error.status) {
      if (error.data?.error_msg) {
        detailedErrorMessage = `${error.status} – ${error.data.error_msg}`;
      } else if (error.statusText) {
        detailedErrorMessage = `${error.status} – ${error.statusText}`;
      }
    }

    return (
      <ErrorPage eyebrow={detailedErrorMessage} headline={error.message}>
        <BitkitButton alignSelf="start" variant="primary" size="lg" onClick={() => refetch()}>
          Try again
        </BitkitButton>
      </ErrorPage>
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
