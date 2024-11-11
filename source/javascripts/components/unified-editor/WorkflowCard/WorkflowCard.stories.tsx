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
    // Workflow actions
    onCreateWorkflow: { type: 'function' },
    onEditWorkflow: { type: 'function' },
    onRemoveWorkflow: { type: 'function' },
    onAddChainedWorkflow: { type: 'function' },
    onRemoveChainedWorkflow: { type: 'function' },
    onChainedWorkflowsUpdate: { type: 'function' },

    onAddStep: { type: 'function' },
    onMoveStep: { type: 'function' },
    onSelectStep: { type: 'function' },
    onUpgradeStep: { type: 'function' },
    onCloneStep: { type: 'function' },
    onDeleteStep: { type: 'function' },
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
