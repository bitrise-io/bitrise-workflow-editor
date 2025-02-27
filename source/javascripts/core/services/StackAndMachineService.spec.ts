import { Stack } from '@/core/models/Stack';
import { MachineType } from '@/core/models/MachineType';
import StackAndMachineService from '@/core/services/StackAndMachineService';

describe('changeStackAndMachine', () => {
  const stacks: Stack[] = [
    {
      id: 'linux-ubuntu-22',
      name: 'Ubuntu 22.04',
      machineTypes: ['standard', 'elite'],
    },
    {
      id: 'osx-xcode-15',
      name: 'Xcode 15',
      machineTypes: ['mac-m1', 'mac-m2'],
    },
    {
      id: 'osx-xcode-16',
      name: 'Xcode 16',
      machineTypes: ['mac-m1', 'mac-m2'],
    },
  ];

  const machines: MachineType[] = [
    {
      id: 'standard',
      name: 'Standard',
      creditCost: 1,
      specs: {
        cpu: { chip: 'AMD', cpuCount: '4', cpuDescription: '4 cores' },
        ram: '8GB',
      },
    },
    {
      id: 'elite',
      name: 'Elite',
      creditCost: 1,
      specs: {
        cpu: { chip: 'AMD', cpuCount: '8', cpuDescription: '8 cores' },
        ram: '16GB',
      },
    },
    {
      id: 'mac-m1',
      name: 'M1',
      creditCost: 2,
      specs: {
        cpu: { chip: 'M1', cpuCount: '8', cpuDescription: '8 cores' },
        ram: '16GB',
      },
    },
    {
      id: 'mac-m2',
      name: 'M2',
      creditCost: 3,
      specs: {
        cpu: { chip: 'M2', cpuCount: '8', cpuDescription: '8 cores' },
        ram: '16GB',
      },
    },
  ];

  it('keeps empty machine type', () => {
    const result = StackAndMachineService.changeStackAndMachine({
      stackId: 'linux-ubuntu-22',
      machineTypeId: '',
      availableStacks: stacks,
      availableMachineTypes: machines,
    });

    expect(result).toEqual({ stackId: 'linux-ubuntu-22', machineTypeId: '' });
  });

  it('keeps stack-compatible machine type', () => {
    const result = StackAndMachineService.changeStackAndMachine({
      stackId: 'osx-xcode-16',
      machineTypeId: 'mac-m1',
      availableStacks: stacks,
      availableMachineTypes: machines,
    });

    expect(result).toEqual({
      stackId: 'osx-xcode-16',
      machineTypeId: 'mac-m1',
    });
  });

  it('clears stack-incompatible machine type', () => {
    const result = StackAndMachineService.changeStackAndMachine({
      stackId: 'linux-ubuntu-22',
      machineTypeId: 'mac-m1',
      availableStacks: stacks,
      availableMachineTypes: machines,
    });

    expect(result).toEqual({ stackId: 'linux-ubuntu-22', machineTypeId: '' });
  });

  it('clears invalid machine type', () => {
    const result = StackAndMachineService.changeStackAndMachine({
      stackId: 'osx-xcode-15',
      machineTypeId: 'invalid-machine',
      availableStacks: stacks,
      availableMachineTypes: machines,
    });

    expect(result).toEqual({ stackId: 'osx-xcode-15', machineTypeId: '' });
  });

  it('clears machine type for empty stack', () => {
    const result = StackAndMachineService.changeStackAndMachine({
      stackId: '',
      machineTypeId: 'mac-m1',
      availableStacks: stacks,
      availableMachineTypes: machines,
    });

    expect(result).toEqual({ stackId: '', machineTypeId: '' });
  });

  it('clears stack and machine type for invalid stack', () => {
    const result = StackAndMachineService.changeStackAndMachine({
      stackId: 'invalid-stack',
      machineTypeId: 'mac-m1',
      availableStacks: stacks,
      availableMachineTypes: machines,
    });

    expect(result).toEqual({ stackId: '', machineTypeId: '' });
  });
});
