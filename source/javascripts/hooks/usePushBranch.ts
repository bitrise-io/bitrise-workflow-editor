import { useToast } from '@bitrise/bitkit';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import BranchesApi from '@/core/api/BranchesApi';
import { ClientError } from '@/core/api/client';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import GlobalProps from '@/core/utils/GlobalProps';
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
      segmentTrack('Push Config Changes Attempted', {
        app_slug: PageProps.appSlug(),
        workspace_slug: GlobalProps.workspaceSlug(),
        // git_provider,
        current_branch: configBranch,
        target_branch: branch,
        is_new_target_branch: branch !== configBranch,
        default_branch: PageProps.app()?.defaultBranch,
      });
    },
    onSuccess: (data, { branch }) => {
      onSuccess?.(data?.pr_url);
      segmentTrack('Push Config Changes Succeeded', {
        app_slug: PageProps.appSlug(),
        workspace_slug: GlobalProps.workspaceSlug(),
        // git_provider,
        current_branch: configBranch,
        target_branch: branch,
        is_new_target_branch: branch !== configBranch,
        default_branch: PageProps.app()?.defaultBranch,
      });
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
              onClick: () =>
                segmentTrack('Open Pr Attempted', {
                  app_slug: PageProps.appSlug(),
                  workspace_slug: GlobalProps.workspaceSlug(),
                  //git_provider,
                  target_branch: branch,
                }),
            }
          : undefined,
      });
    },
    onError: (error, { branch }) => {
      if (error instanceof ClientError && error.status === 409) {
        onMergeConflict?.(branch);
        return;
      }
      segmentTrack('Push Config Changes Failed', {
        app_slug: PageProps.appSlug(),
        workspace_slug: GlobalProps.workspaceSlug(),
        // git_provider,
        current_branch: configBranch,
        target_branch: branch,
        is_new_target_branch: branch !== configBranch,
        default_branch: PageProps.app()?.defaultBranch,
        error_reason: error instanceof ClientError ? error.getResponseErrorMessage() : error.message,
      });

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
