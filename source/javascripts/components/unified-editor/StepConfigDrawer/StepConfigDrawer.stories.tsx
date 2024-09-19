import { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { MockYml } from '@/core/models/BitriseYml.mocks';
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
    onClose: {
      type: 'function',
    },
    stepIndex: {
      control: 'inline-radio',
      options: ['active-ssh-key', 'git-clone'],
      mapping: { 'active-ssh-key': 0, 'git-clone': 1 },
    },
  },
  decorators: [
    (Story) => withBitriseYml(MockYml, Story),
    (Story, { args }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setIsOpen] = useState(args.isOpen);
      return <Story args={{ ...args, isOpen, onClose: () => setIsOpen(false) }} />;
    },
  ],
};

export default meta;

export const Default: Story = {};
