import { Meta, StoryObj } from '@storybook/react-vite';

import PushBranchDialog from '@/components/unified-editor/PushBranchDialog/PushBranchDialog';

export default {
  component: PushBranchDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    onClose: { type: 'function' },
  },
} as Meta<typeof PushBranchDialog>;

export const Default: StoryObj = {};
