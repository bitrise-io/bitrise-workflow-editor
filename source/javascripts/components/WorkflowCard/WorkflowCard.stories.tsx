import { Meta, StoryObj } from '@storybook/react';
import { mockYml } from '../../pages/PipelinesPage/PipelinesPage.mocks';
import WorkflowCard from './WorkflowCard';
import withQueryClientProvider from '@/utils/withQueryClientProvider';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';

export default {
  component: WorkflowCard,
  args: {
    id: 'wf1',
    isExpanded: true,
  },
  argTypes: {
    onClickStep: {
      type: 'function',
    },
    onClickAddStepButton: {
      type: 'function',
    },
    onDeleteWorkflow: {
      type: 'function',
    },
    onDeleteChainedWorkflow: {
      type: 'function',
    },
  },
  decorators: (Story) => withBitriseYml(mockYml, Story),
  render: withQueryClientProvider((props) => <WorkflowCard {...props} />),
} as Meta<typeof WorkflowCard>;

type Story = StoryObj<typeof WorkflowCard>;

export const Default: Story = {};

export const IsFixed: Story = {
  args: {
    isFixed: true,
  },
};

export const IsFixedEditable: Story = {
  args: {
    isFixed: true,
    isEditable: true,
  },
};

export const Empty: Story = {
  args: {
    id: 'empty',
  },
};
