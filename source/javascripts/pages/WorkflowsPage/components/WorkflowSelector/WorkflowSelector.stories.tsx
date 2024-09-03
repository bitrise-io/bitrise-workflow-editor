import { Meta, StoryObj } from '@storybook/react';
import WorkflowSelector from './WorkflowSelector';

type Story = StoryObj<typeof WorkflowSelector>;

const createWorkflowIds = (count = 12): string[] => {
  const items = Array(count).fill(null);

  return items.map((_, index) => {
    const shouldBeUtility = index % 3 === 0;
    return shouldBeUtility ? `_utility_${index}` : `workflow_${index}`;
  }, []);
};

const meta: Meta<typeof WorkflowSelector> = {
  component: WorkflowSelector,
  args: {
    workflowIds: createWorkflowIds(),
    selectedWorkflowId: 'workflow_0',
  },
  argTypes: {
    onSelectWorkflowId: {
      type: 'function',
    },
    onCreateWorkflow: {
      type: 'function',
    },
  },
};

export const Default: Story = {};

export default meta;
