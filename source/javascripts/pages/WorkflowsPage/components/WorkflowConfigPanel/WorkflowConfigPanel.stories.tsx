import { Meta, StoryObj } from '@storybook/react';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import { getAllStacks } from '@/core/api/StackApi.mswMocks';
import { getAllMachineTypes } from '@/core/api/MachineTypeApi.mswMocks';
import WorkflowConfigPanel from './WorkflowConfigPanel';

export default {
  component: WorkflowConfigPanel,
  args: {
    yml: MockYml,
    appSlug: 'app-1',
    defaultValues: {
      workflowId: 'wf1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      configuration: {
        stackId: '',
        machineTypeId: '',
      },
      isMachineTypeSelectorAvailable: true,
    },
  },
  argTypes: {
    onChange: {
      type: 'function',
    },
  },
  parameters: {
    msw: {
      handlers: [getAllStacks(), getAllMachineTypes()],
    },
  },
} as Meta<typeof WorkflowConfigPanel>;

type Story = StoryObj<typeof WorkflowConfigPanel>;

export const Default: Story = {};

export const WithOverrides: Story = {
  args: {
    defaultValues: {
      workflowId: 'workflow-1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      isMachineTypeSelectorAvailable: true,
      configuration: {
        stackId: 'linux-docker-android-22.04',
        machineTypeId: 'elite-xl',
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

export const WithDedicatedMachine: Story = {
  args: {
    appSlug: 'app-1',
    defaultValues: {
      workflowId: 'workflow-1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      isMachineTypeSelectorAvailable: false,
    },
  },
};

export const WithSelfHostedRunner: Story = {
  args: {
    appSlug: 'app-1',
    defaultValues: {
      workflowId: 'workflow-1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: undefined,
      isMachineTypeSelectorAvailable: true,
    },
  },
};
