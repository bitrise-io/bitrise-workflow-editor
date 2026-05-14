import { useToast } from '@bitrise/bitkit';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import {
  trackOpenPrAttempted,
  trackPushConfigChangesAttempted,
  trackPushConfigChangesFailed,
  trackPushConfigChangesSucceeded,
} from '@/core/analytics/ConfigManagementAnalytics';
import BranchesApi from '@/core/api/BranchesApi';
import { ClientError } from '@/core/api/client';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

export type PushBranchPayload = {
  branch: string;
  message: string;
};

type UsePushBranchOptions = {
  onSuccess?: (prUrl?: string) => void;
  onMergeConflict?: (branch: string) => void;
};

function usePushBranch({ onSuccess, onMergeConflict }: UsePushBranchOptions = {}) {
  const toast = useToast();
  const appSlug = PageProps.appSlug();
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const configCommitSha = useBitriseYmlStore((s) => s.configCommitSha);

  const [pushError, setPushError] = useState<string | undefined>();
  const clearPushError = () => setPushError(undefined);

  const { isPending: isPushPending, mutate: pushBranch } = useMutation({
    mutationFn: ({ branch, message }: PushBranchPayload) => {
      if (!configBranch || !configCommitSha) {
        throw new Error('Configuration is not loaded. Please reload and try again.');
      }
      return BranchesApi.pushBranch({
        appSlug,
        branch,
        sourceBranch: configBranch,
        commitSha: configCommitSha,
        bitriseYml: getYmlString(),
        message,
      });
    },
    onMutate: ({ branch }: PushBranchPayload) => {
      trackPushConfigChangesAttempted(configBranch, branch);
    },
    onSuccess: (data, { branch }) => {
      onSuccess?.(data?.pr_url);
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
    },
    onError: (error, { branch }) => {
      if (error instanceof ClientError && error.status === 409) {
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

  return { isPushPending, pushBranch, pushError, clearPushError };
}

export default usePushBranch;
