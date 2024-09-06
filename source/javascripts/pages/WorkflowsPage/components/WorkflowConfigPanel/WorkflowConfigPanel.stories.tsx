import { Meta, StoryObj } from '@storybook/react';
import { MockYml } from '@/core/models/BitriseYml.mocks';
import { getAllStacks } from '@/core/api/StackApi.mswMocks';
import { getAllMachineTypes } from '@/core/api/MachineTypeApi.mswMocks';
import { makeNotificationMetadataEndpoint } from '../../../../components/ConfigurationYmlSource/ConfigurationYmlSource.mswMocks';
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
      isMachineTypeSelectorAvailable: true,
      configuration: {
        stackId: '',
        machineTypeId: '',
      },
    },
  },
  argTypes: {
    onChange: {
      type: 'function',
    },
  },
  parameters: {
    msw: {
      handlers: [getAllStacks(), getAllMachineTypes(), ...makeNotificationMetadataEndpoint()],
    },
  },
} as Meta<typeof WorkflowConfigPanel>;

type Story = StoryObj<typeof WorkflowConfigPanel>;

export const Default: Story = {};

export const PinningTheDefaultStack = {
  args: {
    defaultValues: {
      workflowId: 'wf1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      isMachineTypeSelectorAvailable: true,
      configuration: {
        stackId: 'osx-xcode-15.0.x',
        machineTypeId: '',
      },
    },
  },
};

export const PinningTheDefaultMachine = {
  args: {
    defaultValues: {
      workflowId: 'wf1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      isMachineTypeSelectorAvailable: true,
      configuration: {
        stackId: '',
        machineTypeId: 'g2-m1.8core',
      },
    },
  },
};

export const WithPinningTheDefaultStackAndMachine: Story = {
  args: {
    defaultValues: {
      workflowId: 'workflow-1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      isMachineTypeSelectorAvailable: true,
      configuration: {
        stackId: 'osx-xcode-15.0.x',
        machineTypeId: 'g2-m1.8core',
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

export const PinningACompatibleStack = {
  args: {
    defaultValues: {
      workflowId: 'wf1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      isMachineTypeSelectorAvailable: true,
      configuration: {
        stackId: 'osx-xcode-15.4.x',
        machineTypeId: '',
      },
    },
  },
};

export const PinningAnIncompatibleStack = {
  args: {
    defaultValues: {
      workflowId: 'wf1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      isMachineTypeSelectorAvailable: true,
      configuration: {
        stackId: 'linux-docker-android-20.04',
        machineTypeId: '',
      },
    },
  },
};

export const PinningACompatibleMachine = {
  args: {
    defaultValues: {
      workflowId: 'wf1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      isMachineTypeSelectorAvailable: true,
      configuration: {
        stackId: '',
        machineTypeId: 'g2-m1-max.5core',
      },
    },
  },
};

export const PinningAnIncompatibleMachine = {
  defaultValues: {
    workflowId: 'wf1',
    defaultStackId: 'osx-xcode-15.0.x',
    defaultMachineTypeId: 'g2-m1.8core',
    isMachineTypeSelectorAvailable: true,
    configuration: {
      stackId: '',
      machineTypeId: 'standard',
    },
  },
};

export const PinningNonDefaultStackAndMachine: Story = {
  args: {
    defaultValues: {
      workflowId: 'workflow-1',
      defaultStackId: 'osx-xcode-15.0.x',
      defaultMachineTypeId: 'g2-m1.8core',
      isMachineTypeSelectorAvailable: true,
      configuration: {
        stackId: 'linux-docker-android-22.04',
        machineTypeId: 'elite',
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
