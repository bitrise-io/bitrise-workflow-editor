import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import WithGroupDrawer from './WithGroupDrawer';

export default {
  title: 'javascripts/components/unified-editor/WithGroup',
  component: WithGroupDrawer,
  args: {
    isOpen: true,
    workflowId: 'with-group',
    stepIndex: 0,
  },
  decorators: [(Story) => withBitriseYml(MockYml, Story)],
} as Meta<typeof WithGroupDrawer>;

export const Drawer: StoryObj<typeof WithGroupDrawer> = {};
