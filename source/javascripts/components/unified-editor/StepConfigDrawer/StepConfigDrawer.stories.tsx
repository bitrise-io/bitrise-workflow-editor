import { Meta, StoryObj } from '@storybook/react';
import StepConfigDrawer from './StepConfigDrawer';

type Story = StoryObj<typeof StepConfigDrawer>;

const meta: Meta<typeof StepConfigDrawer> = {
  component: StepConfigDrawer,
  args: {
    isOpen: true,
    workflowId: 'wf1',
    stepIndex: 0,
  },
  argTypes: {
    onClose: { type: 'function' },
    stepIndex: {
      control: 'inline-radio',
      options: ['active-ssh-key', 'git-clone'],
      mapping: { 'active-ssh-key': 0, 'git-clone': 1 },
    },
  },
};

export default meta;

export const Default: Story = {};

export const Script: Story = {
  args: {
    isOpen: true,
    workflowId: 'steplib-steps',
    stepIndex: 5,
  },
};
