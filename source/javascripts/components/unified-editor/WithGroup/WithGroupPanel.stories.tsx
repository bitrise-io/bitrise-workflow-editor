import { Meta, StoryObj } from '@storybook/react';
import WithGroupPanel from './WithGroupPanel';

export default {
  title: 'javascripts/components/unified-editor/WithGroup',
  component: WithGroupPanel,
  args: {
    groupName: 'With group',
    imageName: 'ruby:3.2',
    services: ['postgres', 'redis'],
  },
} as Meta<typeof WithGroupPanel>;

export const Panel: StoryObj<typeof WithGroupPanel> = {};
