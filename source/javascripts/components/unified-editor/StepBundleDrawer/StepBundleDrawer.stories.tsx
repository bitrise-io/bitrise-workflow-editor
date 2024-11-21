import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import StepBundleDrawer from './StepBundleDrawer';

export default {
  title: 'javascripts/components/unified-editor/StepBundle',
  component: StepBundleDrawer,
  args: {
    isOpen: true,
    workflowId: 'wf7',
    stepIndex: 2,
  },
  argTypes: {
    onClose: { type: 'function' },
  },
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
} as Meta<typeof StepBundleDrawer>;

export const Drawer: StoryObj<typeof StepBundleDrawer> = {};
