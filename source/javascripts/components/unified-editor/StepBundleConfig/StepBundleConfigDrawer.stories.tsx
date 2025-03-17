import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import StepBundleConfigDrawer from './StepBundleConfigDrawer';

export default {
  title: 'javascripts/components/unified-editor/StepBundle',
  component: StepBundleConfigDrawer,
  args: {
    isOpen: true,
    parentWorkflowId: 'wf7',
    stepIndex: 2,
  },
  argTypes: {
    onClose: { type: 'function' },
  },
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
} as Meta<typeof StepBundleConfigDrawer>;

export const Drawer: StoryObj<typeof StepBundleConfigDrawer> = {};
