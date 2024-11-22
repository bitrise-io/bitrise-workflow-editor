import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import WithGroupDrawer from './WithGroupDrawer';

export default {
  title: 'javascripts/components/unified-editor/WithGroup',
  component: WithGroupDrawer,
  args: {
    isOpen: true,
    workflowId: 'wf7',
    stepIndex: 3,
  },
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
} as Meta<typeof WithGroupDrawer>;

export const Drawer: StoryObj<typeof WithGroupDrawer> = {};
