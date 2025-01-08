import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
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
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
} as Meta<typeof CreateStepBundleDialog>;

export const Default: StoryObj = {};
