import { Meta, StoryObj } from '@storybook/react';

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
} as Meta<typeof WorkflowCard>;

type Story = StoryObj<typeof WorkflowCard>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    id: 'empty',
  },
};
