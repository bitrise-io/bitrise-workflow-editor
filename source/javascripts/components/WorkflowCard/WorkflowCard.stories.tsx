import { Meta, StoryObj } from '@storybook/react';
import withQueryClientProvider from '@/utils/withQueryClientProvider';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { mockYml } from '../../pages/PipelinesPage/PipelinesPage.mocks';
import WorkflowCard from './WorkflowCard';

export default {
  component: WorkflowCard,
  args: {
    workflowId: 'wf1',
    isExpanded: true,
  },
  argTypes: {
    onAddStep: {
      type: 'function',
    },
    onSelectStep: {
      type: 'function',
    },
    onDeleteWorkflow: {
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
    workflowId: 'empty',
  },
};
