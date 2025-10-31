import { Meta, StoryObj } from '@storybook/react-vite';

import DeleteStepBundleDialog from './DeleteStepBundleDialog';

export default {
  component: DeleteStepBundleDialog,
  args: {
    isOpen: true,
    stepBundleId: 'Step bundle1',
  },
  argTypes: {
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onDeleteStepBundle: { type: 'function' },
  },
} as Meta<typeof DeleteStepBundleDialog>;

export const Default: StoryObj = {};
