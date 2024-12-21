import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
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
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
} as Meta<typeof DeleteStepBundleDialog>;

export const Default: StoryObj = {};
