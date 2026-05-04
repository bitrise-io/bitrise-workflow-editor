import { Box, Button, useDisclosure, useToast } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';
import { useMutation } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';

import ConfigMergeDialog from '@/components/ConfigMergeDialog/ConfigMergeDialog';
import { baseYaml, remoteYaml, yourYaml } from '@/components/ConfigMergeDialog/ConfigMergeDialog.mocks';
import PushBranchDialog, { PushBranchFormValues } from '@/components/unified-editor/PushBranchDialog/PushBranchDialog';
import UpdateConfigurationDialog from '@/components/unified-editor/UpdateConfigurationDialog/UpdateConfigurationDialog';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import BranchesApi from '@/core/api/BranchesApi';
import { ClientError } from '@/core/api/client';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { pushBranch, pushBranchMergeConflict } from './PushBranchDialog.mswMocks';

function PushBranchDialogWithMutation(props: { onMergeConflict?: () => void }) {
  const { onMergeConflict } = props;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isUpdateConfigOpen, onOpen: openUpdateConfig, onClose: closeUpdateConfig } = useDisclosure();
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const configCommitSha = useBitriseYmlStore((s) => s.configCommitSha);

  const { isPending, mutate, error, reset } = useMutation({
    mutationFn: ({ branch, message }: PushBranchFormValues) =>
      BranchesApi.pushBranch({
        appSlug: PageProps.appSlug(),
        branch,
        sourceBranch: configBranch ?? '',
        commitSha: configCommitSha ?? '',
        bitriseYml: getYmlString(),
        message,
      }),
    onSuccess: (data) => {
      onClose();
      toast({
        title: 'Changes pushed successfully',
        description: 'Continue in your git provider and open a pull request.',
        status: 'success',
        isClosable: true,
        action: data?.pr_url ? { label: 'Open PR', href: data.pr_url, target: '_blank' } : undefined,
      });
    },
    onError: (err) => {
      if (err instanceof ClientError && err.status === 409) {
        onClose();
        onMergeConflict?.();
      }
    },
  });

  let pushError: string | undefined;
  if (error instanceof ClientError) {
    if (error.status === 403) {
      pushError = "You don't have permission to push to this branch.";
    } else if (error.status !== 409) {
      pushError = 'Failed to push changes. Please try again.';
    }
  } else if (error) {
    pushError = 'Failed to push changes. Please try again.';
  }

  return (
    <Box padding="25">
      <Button onClick={onOpen}>Save changes</Button>
      <PushBranchDialog
        isOpen={isOpen}
        onClose={() => {
          onClose();
          reset();
        }}
        isPushPending={isPending}
        pushError={pushError}
        onPush={mutate}
        onManualUpdate={openUpdateConfig}
      />
      <UpdateConfigurationDialog isOpen={isUpdateConfigOpen} onClose={closeUpdateConfig} />
    </Box>
  );
}

const meta: Meta<typeof PushBranchDialog> = {
  component: PushBranchDialog,
  parameters: {
    bitriseYmlStore: {
      configBranch: 'main',
    },
    msw: {
      handlers: [pushBranch()],
    },
  },
  render: () => <PushBranchDialogWithMutation />,
};

export default meta;

type Story = StoryObj<typeof PushBranchDialog>;

export const Default: Story = {};

export const NewBranch: Story = {
  parameters: {
    msw: {
      handlers: [pushBranch(undefined, 'https://github.com/owner/repo/compare/main...feature-x?expand=1')],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [pushBranch('Failed to push changes to branch')],
    },
  },
};

function MergeConflictStory() {
  const { isOpen: isMergeOpen, onOpen: openMerge, onClose: closeMerge } = useDisclosure();

  return (
    <>
      <PushBranchDialogWithMutation onMergeConflict={openMerge} />
      <ConfigMergeDialog isOpen={isMergeOpen} onClose={closeMerge} />
    </>
  );
}

export const MergeConflict: Story = {
  render: () => <MergeConflictStory />,
  parameters: {
    msw: {
      handlers: [
        pushBranchMergeConflict(),
        http.get(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), () => HttpResponse.text(remoteYaml)),
      ],
    },
    bitriseYmlStore: {
      configBranch: 'main',
      ymlDocument: YmlUtils.toDoc(yourYaml),
      savedYmlDocument: YmlUtils.toDoc(baseYaml),
      savedYmlVersion: '',
    },
  },
};
