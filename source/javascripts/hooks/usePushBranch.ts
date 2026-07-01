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
import BranchesApi, { PushBranchConflict } from '@/core/api/BranchesApi';
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
  /**
   * Override for the conflict-token commit SHA sent to the BE. Used when re-pushing
   * after a modular conflict was resolved: we reconciled against the new branch HEAD
   * (returned in the 409), so the re-push must be based on that SHA, not the now-stale
   * `configCommitSha` the config was originally loaded at. Omitted for normal pushes.
   */
  baseCommitSha?: string;
};

type UsePushBranchOptions = {
  /** Called after a successful push + store refresh (e.g. to close the dialog). */
  onSuccess?: () => void;
  /**
   * Called on a 409. For a modular push the parsed per-file `conflict` is provided so
   * the caller can open the file-aware merge dialog; for a single-file push it is
   * `undefined` and the caller falls back to the legacy whole-config merge dialog.
   */
  onMergeConflict?: (branch: string, conflict?: PushBranchConflict) => void;
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
    mutationFn: ({ branch, message, baseCommitSha }: PushBranchPayload) => {
      if (!configBranch || !configCommitSha) {
        throw new Error('Configuration is not loaded. Please reload and try again.');
      }

      const common = {
        appSlug,
        branch,
        sourceBranch: configBranch,
        commitSha: baseCommitSha ?? configCommitSha,
        message,
      };
      // Modular sends the full tree (BE validates merged, then pushes edited files); single-file sends bitrise.yml.
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
        description: 'Continue in your Git provider and open a pull request.',
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

      // Reload the pushed branch so the editor reflects the saved state. Modular
      // refreshes the tree in place to preserve open tabs + active selection by
      // stable node_id (a hard reset would drop back to a single root tab).
      if (isModular) {
        const config = await BitriseYmlApi.getConfig({ projectSlug: appSlug, branch });
        applyModularSaveResult({
          root: config.root,
          entityIndex: config.entityIndex,
          branch: config.branch,
          commitSha: config.root.commitSha,
        });
        // Sync React Query's cache, else a later re-seed from the stale pre-push
        // entry (e.g. a dev HMR/StrictMode remount) would revert to the old tree.
        // Scope to the pushed branch — a bare [key, appSlug] prefix would fuzzy-match
        // and clobber every other branch's cached tree with this branch's config.
        queryClient.setQueriesData({ queryKey: [CI_CONFIG_TREE_QUERY_KEY, appSlug, branch] }, config);
      } else {
        const newConfig = await BitriseYmlApi.getCiConfig({ projectSlug: appSlug, branch });
        initializeBitriseYmlDocument(newConfig);
      }
      onSuccess?.();
    },
    onError: (error, { branch }) => {
      if (error instanceof ClientError && error.status === 409) {
        trackPushConfigChangesFailed(configBranch, branch, 'merge_conflict');
        onMergeConflict?.(branch, BranchesApi.parsePushConflict(error));
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
