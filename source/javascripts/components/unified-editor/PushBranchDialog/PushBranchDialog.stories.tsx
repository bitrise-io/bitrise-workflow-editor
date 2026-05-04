import { Box, Button, useDisclosure } from '@bitrise/bitkit';
import { Meta, StoryObj } from '@storybook/react-vite';

import PushBranchDialog from '@/components/unified-editor/PushBranchDialog/PushBranchDialog';

import { pushBranch } from './PushBranchDialog.mswMocks';

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
