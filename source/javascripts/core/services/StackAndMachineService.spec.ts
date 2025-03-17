import { Stack } from '@/core/models/Stack';
import { MachineType } from '@/core/models/MachineType';
import StackAndMachineService from '@/core/services/StackAndMachineService';

describe('changeStackAndMachine', () => {
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
      description:
        'Docker container environment based on Ubuntu 22.04. Preinstalled Android SDK and other common tools.',
      machineTypes: ['standard', 'elite', 'joker'],
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
