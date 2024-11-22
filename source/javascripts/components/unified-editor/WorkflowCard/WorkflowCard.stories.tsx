import { Meta, StoryObj } from '@storybook/react';
import withQueryClientProvider from '@/utils/withQueryClientProvider';
import { withBitriseYml } from '@/contexts/BitriseYmlProvider';
import WorkflowCard from './WorkflowCard';

export default {
  component: WorkflowCard,
  argTypes: {
    // Workflow actions
    onCreateWorkflow: { type: 'function' },
    onChainWorkflow: { type: 'function' },
    onChainChainedWorkflow: { type: 'function' },
    onEditWorkflow: { type: 'function' },
    onEditChainedWorkflow: { type: 'function' },
    onRemoveWorkflow: { type: 'function' },
    onRemoveChainedWorkflow: { type: 'function' },
    onChainedWorkflowsUpdate: {
      type: 'function',
    },
    // Step actions
    onAddStep: { type: 'function' },
    onMoveStep: { type: 'function' },
    onSelectStep: { type: 'function' },
    onUpgradeStep: { type: 'function' },
    onCloneStep: { type: 'function' },
    onDeleteStep: { type: 'function' },
  },
  args: {
    id: 'wf1',
    isCollapsable: true,
  },
  decorators: (Story) => withBitriseYml(TEST_BITRISE_YML, Story),
  render: withQueryClientProvider((props) => <WorkflowCard {...props} />),
} as Meta<typeof WorkflowCard>;

type Story = StoryObj<typeof WorkflowCard>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    id: 'empty',
  },
};
