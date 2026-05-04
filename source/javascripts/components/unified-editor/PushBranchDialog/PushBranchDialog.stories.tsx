import { Box, Button, useDisclosure } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';

import { baseYaml, remoteYaml, yourYaml } from '@/components/ConfigMergeDialog/ConfigMergeDialog.mocks';
import PushBranchDialog from '@/components/unified-editor/PushBranchDialog/PushBranchDialog';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import YmlUtils from '@/core/utils/YmlUtils';

import { pushBranch, pushBranchMergeConflict } from './PushBranchDialog.mswMocks';

const meta: Meta<typeof PushBranchDialog> = {
  component: PushBranchDialog,
  argTypes: {
    onClose: { type: 'function' },
  },
  parameters: {
    bitriseYmlStore: {
      configBranch: 'main',
    },
    msw: {
      handlers: [pushBranch()],
    },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <Box padding="25">
        <Button onClick={onOpen}>Save changes</Button>
        <PushBranchDialog {...args} isOpen={isOpen} onClose={onClose} />
      </Box>
    );
  },
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
