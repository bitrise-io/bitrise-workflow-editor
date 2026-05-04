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
    bitriseYmlStore: {
      configBranch: 'main',
    },
    msw: {
      handlers: [pushBranch()],
    },
  },
} as Meta<typeof PushBranchDialog>;

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
