import { Meta, StoryObj } from '@storybook/react';
import StepDrawer from './StepDrawer';

export default {
  component: StepDrawer,
  argTypes: {
    isOpen: { control: 'boolean' },
  },
  args: {
    isOpen: true,
  },
} as Meta<typeof StepDrawer>;

export const Default: StoryObj = {};
