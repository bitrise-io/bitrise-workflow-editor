import { Meta, StoryObj } from '@storybook/react';
import WorkflowConfigPanel from './WorkflowConfigPanel';
import { mockGetAllStackInfo, mockGetMachineTypeConfigs } from './WorkflowConfigPanel.mswMocks';

export default {
  component: WorkflowConfigPanel,
  args: {
    appSlug: 'app-1',
    workflowId: 'workflow-1',
  },
  argTypes: {
    onChange: {
      type: 'function',
    },
  },
  parameters: {
    msw: {
      handlers: [mockGetAllStackInfo(), mockGetMachineTypeConfigs()],
    },
  },
} as Meta<typeof WorkflowConfigPanel>;

type Story = StoryObj<typeof WorkflowConfigPanel>;

export const Default: Story = {};

export const WithDefaultValues: Story = {
  args: {
    defaultValues: {
      configuration: {
        stack: 'linux-docker-android-22.04',
        machineType: 'elite-xl',
        envs: [
          { key: 'FOO', value: 'Bar', isExpand: true },
          { key: 'HELLO', value: 'World', isExpand: false },
        ],
      },
      properties: {
        title: 'First Workflow',
        summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente unde consectetur minus.',
        description:
          'Ipsum, molestias. Incidunt, accusamus nemo! Totam nulla quia, sapiente ut facere neque doloremque ad, quis velit, debitis dicta! Quidem consequatur commodi eligendi!',
      },
    },
  },
};

export const WithoutAppSlug: Story = {
  args: {
    appSlug: undefined,
  },
};
