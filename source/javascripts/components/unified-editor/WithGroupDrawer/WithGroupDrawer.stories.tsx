import { Meta, StoryObj } from '@storybook/react';
import WithGroupDrawer from './WithGroupDrawer';

export default {
  title: 'javascripts/components/unified-editor/WithGroup',
  component: WithGroupDrawer,
  args: {
    isOpen: true,
    workflowId: 'wf7',
    stepIndex: 3,
  },
} as Meta<typeof WithGroupDrawer>;

export const Drawer: StoryObj<typeof WithGroupDrawer> = {};
