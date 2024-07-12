import { Meta, StoryObj } from '@storybook/react';
import WorkflowSelector from './WorkflowSelector';
import { Workflows } from '@/models/Workflow';

type Story = StoryObj<typeof WorkflowSelector>;

const createWorkflows = (count = 12): Workflows => {
  const items = Array(count).fill(null);

  return items.reduce<Workflows>((workflows, _, index) => {
    const shouldBeUtility = index % 3 === 0;

    const [id, title] = shouldBeUtility
      ? [`_utility_${index}`, `Utility ${index}`]
      : [`workflow_${index}`, `Workflow ${index}`];

    return { ...workflows, ...{ [id]: { title } } };
  }, {});
};

const meta: Meta<typeof WorkflowSelector> = {
  component: WorkflowSelector,
  args: {
    workflows: createWorkflows(),
  },
  argTypes: {
    selectWorkflow: {
      type: 'function',
    },
  },
};

export const Default: Story = {};

export default meta;
