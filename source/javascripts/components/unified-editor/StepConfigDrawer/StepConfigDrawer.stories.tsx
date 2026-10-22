import { Meta, StoryObj } from '@storybook/react-vite';

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
      mapping: { 'active-ssh-key': 3, 'git-clone': 5 },
    },
  },
};

export default meta;

export const Default: Story = {};

// script@1.1.5 is Bitrise-maintained and behind the latest version, so the header shows the
// Bitrise badge and the "Latest version" upgrade warning.
export const OutdatedStep: Story = {
  args: {
    stepIndex: 2,
  },
};

export const Script: Story = {
  args: {
    isOpen: true,
    workflowId: 'steplib-steps',
    stepIndex: 5,
  },
};
