import { useToast } from '@bitrise/bitkit';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { PushBranchFormValues } from '@/components/unified-editor/PushBranchDialog/PushBranchDialog';
import BranchesApi from '@/core/api/BranchesApi';
import { ClientError } from '@/core/api/client';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

type UsePushBranchOptions = {
  onSuccess?: (prUrl?: string) => void;
  onMergeConflict?: () => void;
};

function usePushBranch({ onSuccess, onMergeConflict }: UsePushBranchOptions = {}) {
  const toast = useToast();
  const appSlug = PageProps.appSlug();
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const configCommitSha = useBitriseYmlStore((s) => s.configCommitSha);

  const [pushError, setPushError] = useState<string | undefined>();
  const clearPushError = () => setPushError(undefined);

  const { isPending: isPushPending, mutate: pushBranch } = useMutation({
    mutationFn: ({ branch, message }: PushBranchFormValues) =>
      BranchesApi.pushBranch({
        appSlug,
        branch,
        sourceBranch: configBranch ?? '',
        commitSha: configCommitSha ?? '',
        bitriseYml: getYmlString(),
        message,
      }),
    onSuccess: (data) => {
      onSuccess?.(data?.pr_url);
      toast({
        title: 'Changes pushed successfully',
        description: 'Continue in your git provider and open a pull request.',
        status: 'success',
        isClosable: true,
        action: data?.pr_url ? { label: 'Open PR', href: data.pr_url, target: '_blank' } : undefined,
      });
    },
    onError: (error) => {
      if (error instanceof ClientError && error.status === 409) {
        onMergeConflict?.();
        return;
      }

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
