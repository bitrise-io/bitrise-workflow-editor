import { Box, Button, useDisclosure } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';

import ConfigMergeDialog from '@/components/ConfigMergeDialog/ConfigMergeDialog';
import { baseYaml, remoteYaml, yourYaml } from '@/components/ConfigMergeDialog/ConfigMergeDialog.mocks';
import PushBranchDialog from '@/components/unified-editor/PushBranchDialog/PushBranchDialog';
import UpdateConfigurationDialog from '@/components/unified-editor/UpdateConfigurationDialog/UpdateConfigurationDialog';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import YmlUtils from '@/core/utils/YmlUtils';
import usePushBranch from '@/hooks/usePushBranch';

import { pushBranch, pushBranchMergeConflict } from './PushBranchDialog.mswMocks';

function StoryWrapper({ onMergeConflict }: { onMergeConflict?: () => void }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isUpdateConfigOpen, onOpen: openUpdateConfig, onClose: closeUpdateConfig } = useDisclosure();

  const {
    isPushPending,
    pushBranch: push,
    pushError,
    clearPushError,
  } = usePushBranch({
    onSuccess: onClose,
    onMergeConflict: () => {
      onClose();
      onMergeConflict?.();
    },
  });

  return (
    <Box padding="25">
      <Button onClick={onOpen}>Save changes</Button>
      <PushBranchDialog
        isOpen={isOpen}
        onClose={() => {
          clearPushError();
          onClose();
        }}
        isPushPending={isPushPending}
        pushError={pushError}
        onPush={push}
        onManualUpdate={openUpdateConfig}
      />
      <UpdateConfigurationDialog isOpen={isUpdateConfigOpen} onClose={closeUpdateConfig} />
    </Box>
  );
}

function MergeConflictStory() {
  const { isOpen: isMergeOpen, onOpen: openMerge, onClose: closeMerge } = useDisclosure();

  return (
    <>
      <StoryWrapper onMergeConflict={openMerge} />
      <ConfigMergeDialog isOpen={isMergeOpen} onClose={closeMerge} />
    </>
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
  render: () => <StoryWrapper />,
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
