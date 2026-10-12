import { Box, Button } from '@bitrise/bitkit';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';

import ConfigMergeDialog from '@/components/ConfigMergeDialog/ConfigMergeDialog';
import { baseYaml, remoteYaml, yourYaml } from '@/components/ConfigMergeDialog/ConfigMergeDialog.mocks';
import PushBranchDialog from '@/components/unified-editor/PushBranchDialog/PushBranchDialog';
import UpdateConfigurationDialog from '@/components/unified-editor/UpdateConfigurationDialog/UpdateConfigurationDialog';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import usePushBranch from '@/hooks/usePushBranch';

import { pushBranch, pushBranchMergeConflict } from './PushBranchDialog.mswMocks';

function StoryWrapper({ onMergeConflict }: { onMergeConflict?: (branch: string) => void }) {
  const { open: isOpen, onOpen, onClose } = useDisclosure({ defaultOpen: true });
  const { open: isUpdateConfigOpen, onOpen: openUpdateConfig, onClose: closeUpdateConfig } = useDisclosure();

  const {
    isPushPending,
    pushBranch: push,
    pushError,
    clearPushError,
  } = usePushBranch({
    onSuccess: onClose,
    onMergeConflict: (branch) => {
      onClose();
      onMergeConflict?.(branch);
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
  const configBranch = useBitriseYmlStore((s) => s.configBranch);
  const { open: isMergeOpen, onOpen: openMerge, onClose: closeMerge } = useDisclosure();
  const [mergeContext, setMergeContext] = useState<{
    targetBranch: string;
    isNewTargetBranch: boolean;
  }>();

  return (
    <>
      <StoryWrapper
        onMergeConflict={(branch) => {
          setMergeContext({
            targetBranch: branch,
            isNewTargetBranch: branch !== configBranch,
          });
          openMerge();
        }}
      />
      {mergeContext && (
        <ConfigMergeDialog
          isOpen={isMergeOpen}
          onClose={closeMerge}
          targetBranch={mergeContext.targetBranch}
          isNewTargetBranch={mergeContext.isNewTargetBranch}
        />
      )}
    </>
  );
}

const meta: Meta<typeof PushBranchDialog> = {
  component: PushBranchDialog,

  beforeEach({ msw }) {
    msw.use(pushBranch());
  },

  parameters: {
    bitriseYmlStore: {
      configBranch: 'main',
      configCommitSha: 'abc123',
    },
  },

  render: () => <StoryWrapper />,
};

export default meta;

type Story = StoryObj<typeof PushBranchDialog>;

export const Default: Story = {};

export const NewBranch: Story = {
  beforeEach({ msw }) {
    msw.use(pushBranch(undefined, 'https://github.com/owner/repo/compare/main...feature-x?expand=1'));
  },
};

export const Error: Story = {
  beforeEach({ msw }) {
    msw.use(pushBranch('Failed to push changes to branch'));
  },
};

export const MergeConflict: Story = {
  render: () => <MergeConflictStory />,

  beforeEach({ msw }) {
    msw.use(
      pushBranchMergeConflict(),
      http.get(BitriseYmlApi.ciConfigPath({ projectSlug: ':slug' }), () => HttpResponse.text(remoteYaml)),
    );
  },

  parameters: {
    bitriseYmlStore: {
      configBranch: 'main',
      configCommitSha: 'abc123',
      ymlDocument: YmlUtils.toDoc(yourYaml),
      savedYmlDocument: YmlUtils.toDoc(baseYaml),
      savedYmlVersion: '',
    },
  },
};
