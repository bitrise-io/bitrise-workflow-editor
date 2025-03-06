import { Stack } from '@/core/models/Stack';
import { MachineType } from '@/core/models/MachineType';
import StackAndMachineService from '@/core/services/StackAndMachineService';

describe('changeStackAndMachine', () => {
  const stacks: Stack[] = [
    {
      id: 'osx-xcode-15',
      name: 'Xcode 15',
      machineTypes: ['mac-m1', 'mac-m2', 'joker'],
    },
    {
      id: 'osx-xcode-16',
      name: 'Xcode 16',
      machineTypes: ['mac-m1', 'mac-m2', 'mac-m3', 'mac-m4', 'joker'],
    },
    {
      id: 'linux-ubuntu-22',
      name: 'Ubuntu 22.04',
      machineTypes: ['standard', 'elite', 'joker'],
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
        cpu: { chip: 'M2', cpuCount: '12', cpuDescription: '12 cores' },
        ram: '24GB',
      },
    },
    {
      id: 'mac-m3',
      name: 'M3',
      creditCost: 4,
      specs: {
        cpu: { chip: 'M3', cpuCount: '16', cpuDescription: '16 cores' },
        ram: '32GB',
      },
    },
    {
      id: 'mac-m4',
      name: 'M4',
      creditCost: 8,
      specs: {
        cpu: { chip: 'M4', cpuCount: '24', cpuDescription: '24 cores' },
        ram: '64GB',
      },
    },
    {
      id: 'joker',
      name: 'Joker',
      creditCost: 16,
      specs: {
        cpu: { chip: 'Joker', cpuCount: '64', cpuDescription: '64 cores' },
        ram: '128GB',
      },
    },
  ];

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
