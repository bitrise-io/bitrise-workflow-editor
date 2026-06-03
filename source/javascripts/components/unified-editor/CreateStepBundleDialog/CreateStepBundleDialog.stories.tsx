import { Meta, StoryObj } from '@storybook/react-vite';

import CreateStepBundleDialog from './CreateStepBundleDialog';

export default {
  component: CreateStepBundleDialog,
  args: {
    isOpen: true,
  },
  argTypes: {
    isOpen: { type: 'boolean' },
    onClose: { type: 'function' },
    onCreateStepBundle: { type: 'function' },
  },
} as Meta<typeof CreateStepBundleDialog>;

export const Default: StoryObj = {};
