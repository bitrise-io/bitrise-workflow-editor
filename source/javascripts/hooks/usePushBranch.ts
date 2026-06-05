import { useToast } from '@bitrise/bitkit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
  trackOpenPrAttempted,
  trackPushConfigChangesAttempted,
  trackPushConfigChangesFailed,
  trackPushConfigChangesSucceeded,
} from '@/core/analytics/ConfigManagementAnalytics';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import BranchesApi from '@/core/api/BranchesApi';
import { ClientError } from '@/core/api/client';
import {
  applyModularSaveResult,
  getModularConfigTree,
  getYmlString,
  initializeBitriseYmlDocument,
} from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { CI_CONFIG_TREE_QUERY_KEY } from '@/hooks/useCiConfigTree';

export type PushBranchPayload = {
  branch: string;
  message: string;
};

type UsePushBranchOptions = {
  /** Called after a successful push + store refresh (e.g. to close the dialog). */
  onSuccess?: () => void;
  onMergeConflict?: (branch: string) => void;
};

function usePushBranch({ onSuccess, onMergeConflict }: UsePushBranchOptions = {}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const appSlug = PageProps.appSlug();
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const configCommitSha = useBitriseYmlStore((s) => s.configCommitSha);
  const isModular = useBitriseYmlStore((s) => Boolean(s.tree));

  const [pushError, setPushError] = useState<string | undefined>();
  const clearPushError = () => setPushError(undefined);

  const { isPending: isPushPending, mutate: pushBranch } = useMutation({
    mutationFn: ({ branch, message }: PushBranchPayload) => {
      if (!configBranch || !configCommitSha) {
        throw new Error('Configuration is not loaded. Please reload and try again.');
      }

      const common = { appSlug, branch, sourceBranch: configBranch, commitSha: configCommitSha, message };
      // Modular: send the full tree (BE validates the merged config, then pushes
      // the modified editable files). Single-file: the one bitrise.yml.
      return isModular
        ? BranchesApi.pushBranch({ ...common, root: getModularConfigTree() })
        : BranchesApi.pushBranch({ ...common, bitriseYml: getYmlString() });
    },
    onMutate: ({ branch }: PushBranchPayload) => {
      trackPushConfigChangesAttempted(configBranch, branch);
    },
    onSuccess: async (data, { branch }) => {
      trackPushConfigChangesSucceeded(configBranch, branch);
      toast({
        title: 'Changes pushed successfully',
        description: 'Continue in your git provider and open a pull request.',
        status: 'success',
        isClosable: true,
        action: data?.pr_url
          ? {
              label: 'Open PR',
              href: data.pr_url,
              target: '_blank',
              onClick: () => trackOpenPrAttempted(branch),
            }
          : undefined,
      });

      // Reload the pushed branch so the editor reflects the saved state (edits
      // are no longer dirty). Modular: refresh the tree in place via
      // applyModularSaveResult, which **preserves the open tabs + active selection**
      // (including the Merged-config view) by stable node_id — rather than the
      // hard reset initializeModularConfig does (which would drop the user back to
      // a single root tab). Single-file: re-seed the one doc.
      if (isModular) {
        const config = await BitriseYmlApi.getConfig({ projectSlug: appSlug, branch });
        applyModularSaveResult({
          root: config.root,
          entityIndex: config.entityIndex,
          branch: config.branch,
          commitSha: config.root.commitSha,
        });
        // Sync React Query's config-tree cache with the freshly pushed tree.
        // Without this the cache still holds the pre-push tree (keyed to the
        // branch first loaded), and any later re-seed of the store from that
        // stale entry (a dev HMR/StrictMode remount of InitialDataLoader, etc.)
        // would silently revert the editor to the old module tree.
        queryClient.setQueriesData({ queryKey: [CI_CONFIG_TREE_QUERY_KEY, appSlug] }, config);
      } else {
        const newConfig = await BitriseYmlApi.getCiConfig({ projectSlug: appSlug, branch });
        initializeBitriseYmlDocument(newConfig);
      }
      onSuccess?.();
    },
    onError: (error, { branch }) => {
      if (error instanceof ClientError && error.status === 409) {
        trackPushConfigChangesFailed(configBranch, branch, 'merge_conflict');
        onMergeConflict?.(branch);
        return;
      }

      trackPushConfigChangesFailed(
        configBranch,
        branch,
        error instanceof ClientError ? error.getResponseErrorMessage() : error.message,
      );

      if (error instanceof ClientError && error.status === 403) {
        setPushError("You don't have permission to push to this branch.");
      } else {
        setPushError('Failed to push changes. Please try again.');
      }
    },
  });

  return { isPushPending, pushBranch, pushError, setPushError, clearPushError };
}

export default usePushBranch;
