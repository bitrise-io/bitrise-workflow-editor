import { Meta, StoryObj } from '@storybook/react-vite';

import PushBranchDialog from '@/components/unified-editor/PushBranchDialog/PushBranchDialog';

import { pushBranch } from './PushBranchDialog.mswMocks';

export default {
  component: PushBranchDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    onClose: { type: 'function' },
  },
  parameters: {
    msw: {
      handlers: [pushBranch()],
    },
  },
} as Meta<typeof PushBranchDialog>;

type Story = StoryObj<typeof PushBranchDialog>;

export const Default: Story = {};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [pushBranch('Failed to push changes to branch')],
    },
  },
};
