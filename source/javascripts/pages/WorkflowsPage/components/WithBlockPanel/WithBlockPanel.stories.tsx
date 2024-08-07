import { Meta, StoryObj } from '@storybook/react';
import WithBlockPanel from './WithBlockPanel';

export default {
  args: {
    stepDisplayName: 'With group',
    withBlockData: {
      image: 'ruby:3.2',
      services: ['postgres:13'],
    },
  },
  component: WithBlockPanel,
} as Meta<typeof WithBlockPanel>;

export const WithBlock: StoryObj<typeof WithBlockPanel> = {};
