import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import StepBundleDrawer from './StepBundleDrawer';

export default {
  title: 'javascripts/components/unified-editor/StepBundle',
  component: StepBundleDrawer,
  args: {
    isOpen: true,
    workflowId: 'step-bundle',
    stepIndex: 0,
  },
  decorators: [(Story) => withBitriseYml(MockYml, Story)],
} as Meta<typeof StepBundleDrawer>;

export const Drawer: StoryObj<typeof StepBundleDrawer> = {};
