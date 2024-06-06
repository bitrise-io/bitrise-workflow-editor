import { Meta, StoryObj } from '@storybook/react';
import WorkflowConfigPanel from './WorkflowConfigPanel';

export default {
  component: WorkflowConfigPanel,
  args: { workflowId: 'workflow-1' },
  argTypes: { onChange: { type: 'function' } },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta<typeof WorkflowConfigPanel>;

type Story = StoryObj<typeof WorkflowConfigPanel>;

export const Default: Story = {};

export const WithDefaultValues: Story = {
  args: {
    defaultValues: {
      properties: {
        title: 'First Workflow',
        summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente unde consectetur minus.',
        description:
          'Ipsum, molestias. Incidunt, accusamus nemo! Totam nulla quia, sapiente ut facere neque doloremque ad, quis velit, debitis dicta! Quidem consequatur commodi eligendi!',
      },
    },
  },
};
