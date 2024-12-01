import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
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
  decorators: [(Story) => withBitriseYml(TEST_BITRISE_YML, Story)],
};

export default meta;

export const Default: Story = {};
