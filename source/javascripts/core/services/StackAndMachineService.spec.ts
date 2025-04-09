import { Stack } from '@/core/models/Stack';
import { MachineType } from '@/core/models/MachineType';
import StackAndMachineService from '@/core/services/StackAndMachineService';
import StackService from '@/core/services/StackService';
import MachineTypeService from '@/core/services/MachineTypeService';

const stacks: Stack[] = [
  {
    id: 'osx-xcode-16',
    name: 'Xcode 16',
    description:
      'Xcode 16.0 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
    machineTypes: ['mac-m1', 'mac-m2', 'mac-m3', 'mac-m4', 'joker'],
  },
  {
    id: 'osx-xcode-15',
    name: 'Xcode 15',
    description:
      'Xcode 15.0.1 based on macOS 13.5 Ventura.\n\nThe Android SDK and other common mobile tools are also installed.',
    machineTypes: ['mac-m1', 'mac-m2', 'joker'],
  },
  {
    id: 'linux-ubuntu-22',
    name: 'Ubuntu 22.04',
    description: 'Docker container environment based on Ubuntu 22.04. Preinstalled Android SDK and other common tools.',
    machineTypes: ['standard', 'elite', 'joker'],
  },
  {
    id: 'agent-pool-stack',
    name: 'Self-hosted agent',
    description: '',
    machineTypes: [],
  },
];

const machines: MachineType[] = [
  {
    id: 'standard',
    name: 'Standard',
    creditPerMinute: 1,
    ram: '8GB',
    chip: 'AMD',
    cpuCount: '4',
    cpuDescription: '4 cores',
  },
  {
    id: 'elite',
    name: 'Elite',
    creditPerMinute: 1,
    ram: '16GB',
    chip: 'AMD',
    cpuCount: '8',
    cpuDescription: '8 cores',
  },
  {
    id: 'mac-m1',
    name: 'M1',
    creditPerMinute: 2,
    ram: '16GB',
    chip: 'M1',
    cpuCount: '8',
    cpuDescription: '8 cores',
  },
  {
    id: 'mac-m2',
    name: 'M2',
    creditPerMinute: 3,
    ram: '24GB',
    chip: 'M2',
    cpuCount: '12',
    cpuDescription: '12 cores',
  },
  {
    id: 'mac-m3',
    name: 'M3',
    creditPerMinute: 4,
    ram: '32GB',
    chip: 'M3',
    cpuCount: '16',
    cpuDescription: '16 cores',
  },
  {
    id: 'mac-m4',
    name: 'M4',
    creditPerMinute: 8,
    ram: '64GB',
    chip: 'M4',
    cpuCount: '24',
    cpuDescription: '24 cores',
  },
  {
    id: 'joker',
    name: 'Joker',
    creditPerMinute: 16,
    ram: '128GB',
    chip: 'Joker',
    cpuCount: '64',
    cpuDescription: '64 cores',
  },
];

describe('prepareStackAndMachineSelectionData', () => {
  it('returns the default stack when empty stack value is selected', () => {
    const result = StackAndMachineService.prepareStackAndMachineSelectionData({
      selectedStackId: '',
      selectedMachineTypeId: '',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
    });

    // Stack
    expect(result.isInvalidStack).toBe(false);
    expect(result.selectedStack).toEqual(
      expect.objectContaining({
        value: '',
        id: 'osx-xcode-16',
        name: 'Xcode 16',
      }),
    );

    // Stack options
    const [defaultStack, ...stackOptions] = result.availableStackOptions;
    expect(defaultStack).toEqual({ value: '', label: 'Default (Xcode 16)' });
    expect(stackOptions).toEqual(stacks.map(StackService.toStackOption));
  });

  it('returns the selected stack when a valid stack is selected', () => {
    const result = StackAndMachineService.prepareStackAndMachineSelectionData({
      selectedStackId: 'osx-xcode-15',
      selectedMachineTypeId: '',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
    });

    // Stack
    expect(result.isInvalidStack).toBe(false);
    expect(result.selectedStack).toEqual(
      expect.objectContaining({
        value: 'osx-xcode-15',
        id: 'osx-xcode-15',
        name: 'Xcode 15',
      }),
    );

    // Stack options
    const [defaultStack, ...stackOptions] = result.availableStackOptions;
    expect(defaultStack).toEqual({ value: '', label: 'Default (Xcode 16)' });
    expect(stackOptions).toEqual(stacks.map(StackService.toStackOption));
  });

  it('returns the invalid stack when an invalid stack is selected', () => {
    const result = StackAndMachineService.prepareStackAndMachineSelectionData({
      selectedStackId: 'osx-xcode-11',
      selectedMachineTypeId: '',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
    });

    // Stack
    expect(result.isInvalidStack).toBe(true);
    expect(result.selectedStack).toEqual(
      expect.objectContaining({
        value: 'osx-xcode-11',
        id: 'osx-xcode-11',
        name: 'osx-xcode-11',
      }),
    );

    // Stack options
    const [defaultStack, ...stackOptions] = result.availableStackOptions;
    expect(defaultStack).toEqual({ value: '', label: 'Default (Xcode 16)' });
    expect(stackOptions.slice(0, -1)).toEqual(stacks.map(StackService.toStackOption));

    // Invalid stack option
    expect(stackOptions.slice(-1)).toEqual([{ value: 'osx-xcode-11', label: 'osx-xcode-11' }]);
  });

  it('returns the default machine type when empty machine type value is selected', () => {
    const result = StackAndMachineService.prepareStackAndMachineSelectionData({
      selectedStackId: '',
      selectedMachineTypeId: '',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
    });

    // Machine type
    expect(result.isInvalidMachineType).toBe(false);
    expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: 'mac-m1', name: 'M1' }));

    // Machine type options
    const selectableMachines = MachineTypeService.getMachinesOfStack(machines, result.selectedStack);
    const [defaultMachineType, ...machineOptions] = result.availableMachineTypeOptions;
    expect(defaultMachineType).toEqual({ value: '', label: 'Default (M1)' });
    expect(machineOptions).toEqual(selectableMachines.map(MachineTypeService.toMachineOption));
  });

  it('returns the selected machine type when a valid machine type is selected', () => {
    const result = StackAndMachineService.prepareStackAndMachineSelectionData({
      selectedStackId: '',
      selectedMachineTypeId: 'mac-m2',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
    });

    // Machine type
    expect(result.isInvalidMachineType).toBe(false);
    expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: 'mac-m2', id: 'mac-m2', name: 'M2' }));

    // Machine type options
    const selectableMachines = MachineTypeService.getMachinesOfStack(machines, result.selectedStack);
    const [defaultMachineType, ...machineOptions] = result.availableMachineTypeOptions;
    expect(defaultMachineType).toEqual({ value: '', label: 'Default (M1)' });
    expect(machineOptions).toEqual(selectableMachines.map(MachineTypeService.toMachineOption));
  });

  it('returns the invalid machine type when an invalid machine type is selected', () => {
    const result = StackAndMachineService.prepareStackAndMachineSelectionData({
      selectedStackId: '',
      selectedMachineTypeId: 'mac-intel',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
    });

    // Machine type
    expect(result.isInvalidMachineType).toBe(true);
    expect(result.selectedMachineType).toEqual(
      expect.objectContaining({
        value: 'mac-intel',
        id: 'mac-intel',
        name: 'mac-intel',
      }),
    );

    // Machine type options
    const selectableMachines = MachineTypeService.getMachinesOfStack(machines, result.selectedStack);
    const [defaultMachineType, ...machineOptions] = result.availableMachineTypeOptions;
    expect(defaultMachineType).toEqual({ value: '', label: 'Default (M1)' });
    expect(machineOptions.slice(0, -1)).toEqual(selectableMachines.map(MachineTypeService.toMachineOption));

    // Invalid machine type option
    expect(machineOptions.slice(-1)).toEqual([{ value: 'mac-intel', label: 'mac-intel' }]);
  });

  it('returns self-hosted runner when agent pool is selected', () => {
    const result = StackAndMachineService.prepareStackAndMachineSelectionData({
      selectedStackId: 'agent-pool-stack',
      selectedMachineTypeId: '',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
    });

    // Stack
    expect(result.isInvalidStack).toBe(false);
    expect(result.selectedStack).toEqual(
      expect.objectContaining({
        value: 'agent-pool-stack',
        id: 'agent-pool-stack',
        name: 'Self-hosted agent',
      }),
    );

    // Machine type
    expect(result.isInvalidMachineType).toBe(false);
    expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: '', name: '' }));

    // Machine type options
    expect(result.isMachineTypeSelectionDisabled).toBe(true);
    expect(result.availableMachineTypeOptions).toEqual([{ label: 'Self-Hosted Runner', value: '' }]);
  });

  it('returns dedicated machine when dedicated machine is assigned', () => {
    const result = StackAndMachineService.prepareStackAndMachineSelectionData({
      selectedStackId: '',
      selectedMachineTypeId: '',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
      hasDedicatedMachine: true,
    });

    // Machine type
    expect(result.isInvalidMachineType).toBe(false);
    expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: '', name: '' }));

    // Machine type options
    expect(result.isMachineTypeSelectionDisabled).toBe(true);
    expect(result.availableMachineTypeOptions).toEqual([{ label: 'Dedicated Machine', value: '' }]);
  });

  describe('withoutDefaults', () => {
    it('returns the default stack and machine type when empty stack and machine type values are selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
        defaultMachineTypeId: 'mac-m1',
        withoutDefaults: true,
      });

      // Stack
      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({
          value: 'osx-xcode-16',
          id: 'osx-xcode-16',
          name: 'Xcode 16',
        }),
      );

      // Stack options
      expect(result.availableStackOptions).toEqual(stacks.map(StackService.toStackOption));

      // Machine type
      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({ value: 'mac-m1', id: 'mac-m1', name: 'M1' }),
      );

      // Machine type options
      const selectableMachines = MachineTypeService.getMachinesOfStack(machines, result.selectedStack);
      expect(result.availableMachineTypeOptions).toEqual(selectableMachines.map(MachineTypeService.toMachineOption));
    });

    it('returns the selected stack and the default machine type of the stack', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: 'osx-xcode-16',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'linux-ubuntu-22',
        defaultMachineTypeId: 'elite',
        defaultMachineTypeIdOfOSs: {
          linux: 'elite',
          osx: 'mac-m1',
        },
        withoutDefaults: true,
      });

      // Stack
      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({
          value: 'osx-xcode-16',
          id: 'osx-xcode-16',
          name: 'Xcode 16',
        }),
      );

      // Stack options
      expect(result.availableStackOptions).toEqual(stacks.map(StackService.toStackOption));

      // Machine type
      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({ value: 'mac-m1', id: 'mac-m1', name: 'M1' }),
      );

      // Machine type options
      const selectableMachines = MachineTypeService.getMachinesOfStack(machines, result.selectedStack);
      expect(result.availableMachineTypeOptions).toEqual(selectableMachines.map(MachineTypeService.toMachineOption));
    });
  });
});

describe('changeStackAndMachine', () => {
  describe('stack OS remains the same', () => {
    it('keeps the default stack and machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: '',
        machineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({ stackId: '', machineTypeId: '' });
    });

    it('keeps the default stack with a compatible machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: '',
        machineTypeId: 'mac-m1',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({ stackId: '', machineTypeId: 'mac-m1' });
    });

    it('keeps the default stack, but changes the incompatible machine type to default machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: '',
        machineTypeId: 'standard',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({ stackId: '', machineTypeId: '' });
    });

    it('keeps a specific stack with the default machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: 'osx-xcode-15',
        machineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({ stackId: 'osx-xcode-15', machineTypeId: '' });
    });

    it('keeps a specific stack with a compatible machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: 'osx-xcode-15',
        machineTypeId: 'mac-m1',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({
        stackId: 'osx-xcode-15',
        machineTypeId: 'mac-m1',
      });
    });

    it('keeps a specific stack, but changes the incompatible machine type to default machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: 'osx-xcode-15',
        machineTypeId: 'mac-m4',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({ stackId: 'osx-xcode-15', machineTypeId: '' });
    });

    it('keeps the pinned default stack with the default machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: 'osx-xcode-16',
        machineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({ stackId: 'osx-xcode-16', machineTypeId: '' });
    });

    it('keeps the pinned default stack with a compatible machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: 'osx-xcode-16',
        machineTypeId: 'mac-m1',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({
        stackId: 'osx-xcode-16',
        machineTypeId: 'mac-m1',
      });
    });

    it('keeps the pinned default stack, but changes the incompatible machine type to default machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: 'osx-xcode-16',
        machineTypeId: 'standard',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({ stackId: 'osx-xcode-16', machineTypeId: '' });
    });
  });

  describe('stack OS changes', () => {
    it('keeps a specific stack with the default machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: 'linux-ubuntu-22',
        machineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({ stackId: 'linux-ubuntu-22', machineTypeId: '' });
    });

    it('keeps a specific stack with a compatible machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: 'linux-ubuntu-22',
        machineTypeId: 'joker',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({
        stackId: 'linux-ubuntu-22',
        machineTypeId: 'joker',
      });
    });

    it('keeps a specific stack, but changes the incompatible machine type to default machine type', () => {
      const result = StackAndMachineService.changeStackAndMachine({
        stackId: 'linux-ubuntu-22',
        machineTypeId: 'mac-m4',
        availableStacks: stacks,
        availableMachineTypes: machines,
        defaultStackId: 'osx-xcode-16',
      });

      expect(result).toEqual({ stackId: 'linux-ubuntu-22', machineTypeId: '' });
    });
  });
});

describe('selectFinalMachineTypeId', () => {
  it('returns selectedMachineTypeId if not empty', () => {
    const result = StackAndMachineService.selectFinalMachineTypeId({
      selectedStackId: 'osx-xcode-16',
      selectedMachineTypeId: 'mac-m2',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
    });

    expect(result).toBe('mac-m2');
  });

  it('returns defaultMachineTypeId if selectedMachineTypeId is empty', () => {
    const result = StackAndMachineService.selectFinalMachineTypeId({
      selectedStackId: 'osx-xcode-16',
      selectedMachineTypeId: '',
      availableStacks: stacks,
      availableMachineTypes: machines,
      defaultStackId: 'osx-xcode-16',
      defaultMachineTypeId: 'mac-m1',
    });

    expect(result).toBe('mac-m1');
  });
});
