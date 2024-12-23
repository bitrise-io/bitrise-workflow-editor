import { Meta, StoryObj } from '@storybook/react';
import CreateStepBundleDialog from '@/pages/StepBundlesPage/components/CreateStepBundleDialog/CreateStepBundleDialog';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';

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
