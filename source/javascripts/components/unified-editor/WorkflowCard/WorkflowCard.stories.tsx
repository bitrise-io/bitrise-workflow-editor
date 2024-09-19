import { Meta, StoryObj } from '@storybook/react';
import withQueryClientProvider from '@/utils/withQueryClientProvider';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import WorkflowCard from './WorkflowCard';

export default {
  component: WorkflowCard,
  args: {
    id: 'wf1',
    isCollapsable: true,
  },
  argTypes: {
    onStepMove: { type: 'function' },
    onStepSelect: { type: 'function' },
    onAddStepClick: { type: 'function' },
    onUpgradeStep: { type: 'function' },
    onCloneStep: { type: 'function' },
    onDeleteStep: { type: 'function' },
    onChainedWorkflowsUpdate: { type: 'function' },
    onEditWorkflowClick: { type: 'function' },
    onAddChainedWorkflowClick: { type: 'function' },
    onDeleteChainedWorkflowClick: { type: 'function' },
  },
  decorators: (Story) => withBitriseYml(MockYml, Story),
  render: withQueryClientProvider((props) => <WorkflowCard {...props} />),
} as Meta<typeof WorkflowCard>;

type Story = StoryObj<typeof WorkflowCard>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    id: 'empty',
  },
};
