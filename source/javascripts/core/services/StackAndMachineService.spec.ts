import { MachineType, Stack, StackOption } from '@/core/models/StackAndMachine';
import StackAndMachineService, { StackAndMachineSource } from '@/core/services/StackAndMachineService';

import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';

const stacks: Stack[] = [
  {
    id: 'osx-xcode-16.0.x',
    name: 'Xcode 16.0.x',
    status: 'stable',
    description:
      'Xcode 16.0 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
    machineTypes: ['mac-m1', 'mac-m2', 'mac-m3', 'mac-m4', 'joker'],
    os: 'macos',
  },
  {
    id: 'osx-xcode-15.0.x',
    name: 'Xcode 15.0.x',
    status: 'stable',
    description:
      'Xcode 15.0.1 based on macOS 13.5 Ventura.\n\nThe Android SDK and other common mobile tools are also installed.',
    machineTypes: ['mac-m1', 'mac-m2', 'joker'],
    os: 'macos',
  },
  {
    id: 'ubuntu-jammy-22.04-bitrise-2024',
    name: 'Ubuntu Jammy - Bitrise 2024 Edition',
    status: 'stable',
    description: 'Docker container environment based on Ubuntu 22.04. Preinstalled Android SDK and other common tools.',
    machineTypes: ['standard', 'elite', 'joker'],
    os: 'linux',
  },
  {
    id: 'agent-pool-stack',
    name: 'Self-hosted agent',
    description: '',
    machineTypes: [],
    os: 'unknown',
    status: 'unknown',
  },
];

const machines: MachineType[] = [
  {
    availableOnStacks: [],
    id: 'standard',
    name: 'Standard',
    creditPerMinute: 1,
    ram: '8GB',
    chip: 'AMD',
    cpuCount: '4',
    cpuDescription: '4 cores',
    osId: 'osx',
  },
  {
    availableOnStacks: [],
    id: 'elite',
    name: 'Elite',
    creditPerMinute: 1,
    ram: '16GB',
    chip: 'AMD',
    cpuCount: '8',
    cpuDescription: '8 cores',
    osId: 'osx',
  },
  {
    availableOnStacks: [],
    id: 'mac-m1',
    name: 'M1',
    creditPerMinute: 2,
    ram: '16GB',
    chip: 'M1',
    cpuCount: '8',
    cpuDescription: '8 cores',
    osId: 'osx',
  },
  {
    availableOnStacks: [],
    id: 'mac-m2',
    name: 'M2',
    creditPerMinute: 3,
    ram: '24GB',
    chip: 'M2',
    cpuCount: '12',
    cpuDescription: '12 cores',
    osId: 'osx',
  },
  {
    availableOnStacks: [],
    id: 'mac-m3',
    name: 'M3',
    creditPerMinute: 4,
    ram: '32GB',
    chip: 'M3',
    cpuCount: '16',
    cpuDescription: '16 cores',
    osId: 'osx',
  },
  {
    availableOnStacks: [],
    id: 'mac-m4',
    name: 'M4',
    creditPerMinute: 8,
    ram: '64GB',
    chip: 'M4',
    cpuCount: '24',
    cpuDescription: '24 cores',
    osId: 'osx',
  },
  {
    availableOnStacks: [],
    id: 'joker',
    name: 'Joker',
    creditPerMinute: 16,
    ram: '128GB',
    chip: 'Joker',
    cpuCount: '64',
    cpuDescription: '64 cores',
    osId: 'osx',
  },
];

describe('StackAndMachineService', () => {
  describe('prepareStackAndMachineSelectionData', () => {
    it('returns the default stack when empty stack value is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      // Stack
      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({
          value: '',
          id: 'osx-xcode-16.0.x',
          name: 'Xcode 16.0.x',
        }),
      );

      // Stack options
      const [defaultStack, ...stackOptions] = result.availableStackOptions;
      expect(defaultStack).toEqual({ value: '', label: 'Default (Xcode 16.0.x)', status: 'stable' });
      expect(stackOptions).toEqual(stacks.map(StackAndMachineService.toStackOption));
    });

    it('returns the selected stack when a valid stack is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: 'osx-xcode-15.0.x',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      // Stack
      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({
          value: 'osx-xcode-15.0.x',
          id: 'osx-xcode-15.0.x',
          name: 'Xcode 15.0.x',
        }),
      );

      // Stack options
      const [defaultStack, ...stackOptions] = result.availableStackOptions;
      expect(defaultStack).toEqual({ value: '', label: 'Default (Xcode 16.0.x)', status: 'stable' });
      expect(stackOptions).toEqual(stacks.map(StackAndMachineService.toStackOption));
    });

    it('returns the invalid stack when an invalid stack is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: 'osx-xcode-11',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
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
      expect(defaultStack).toEqual({ value: '', label: 'Default (Xcode 16.0.x)', status: 'stable' });
      expect(stackOptions.slice(0, -1)).toEqual(stacks.map(StackAndMachineService.toStackOption));

      // Invalid stack option
      expect(stackOptions.slice(-1)).toEqual([{ value: 'osx-xcode-11', label: 'osx-xcode-11', status: 'unknown' }]);
    });

    it('returns the default machine type when empty machine type value is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      // Machine type
      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: 'mac-m1', name: 'M1' }));

      // Machine type options
      const selectableMachines = StackAndMachineService.getMachinesOfStack(machines, result.selectedStack);
      const [defaultMachineType, ...machineOptions] = result.availableMachineTypeOptions;
      expect(defaultMachineType).toEqual({ value: '', label: 'Default (M1)', osId: 'osx' });
      expect(machineOptions).toEqual(selectableMachines.map(StackAndMachineService.toMachineOption));
    });

    it('returns the selected machine type when a valid machine type is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: 'mac-m2',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      // Machine type
      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({ value: 'mac-m2', id: 'mac-m2', name: 'M2' }),
      );

      // Machine type options
      const selectableMachines = StackAndMachineService.getMachinesOfStack(machines, result.selectedStack);
      const [defaultMachineType, ...machineOptions] = result.availableMachineTypeOptions;
      expect(defaultMachineType).toEqual({ value: '', label: 'Default (M1)', osId: 'osx' });
      expect(machineOptions).toEqual(selectableMachines.map(StackAndMachineService.toMachineOption));
    });

    it('returns the invalid machine type when an invalid machine type is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: 'mac-intel',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
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
      const selectableMachines = StackAndMachineService.getMachinesOfStack(machines, result.selectedStack);
      const [defaultMachineType, ...machineOptions] = result.availableMachineTypeOptions;
      expect(defaultMachineType).toEqual({ value: '', label: 'Default (M1)', osId: 'osx' });
      expect(machineOptions.slice(0, -1)).toEqual(selectableMachines.map(StackAndMachineService.toMachineOption));

      // Invalid machine type option
      expect(machineOptions.slice(-1)).toEqual([{ value: 'mac-intel', label: 'mac-intel' }]);
    });

    it('returns self-hosted runner when agent pool is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: 'agent-pool-stack',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
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

    it('returns machines for dedicated accounts with available machines', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
        runningBuildsOnPrivateCloud: true,
      });

      // Machine type
      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: 'mac-m1', name: 'M1' }));

      // Machine type options
      expect(result.isMachineTypeSelectionDisabled).toBe(false);
      const [defaultMachineType, ...machineOptions] = result.availableMachineTypeOptions;
      expect(defaultMachineType).toEqual({ value: '', label: 'Default (M1)', osId: 'osx' });
      const selectableMachines = StackAndMachineService.getMachinesOfStack(machines, result.selectedStack);
      expect(machineOptions).toEqual(selectableMachines.map(StackAndMachineService.toMachineOption));
    });

    it('returns disabled selection for dedicated accounts with no available machines', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: [],
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
        runningBuildsOnPrivateCloud: true,
      });

      // Machine type
      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: '', name: '' }));

      // Machine type options
      expect(result.isMachineTypeSelectionDisabled).toBe(true);
      expect(result.availableMachineTypeOptions).toEqual([{ label: 'Dedicated Machine', value: '' }]);
    });

    it('returns promoted machine types when available', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
        machineTypePromotion: {
          mode: 'trial',
          promotedMachineTypes: [
            {
              id: 'mac-m5',
              name: 'M5',
              creditPerMinute: 16,
              ram: '128GB',
              chip: 'M5',
              cpuCount: '36',
              cpuDescription: '36 cores',
              osId: 'osx',
              availableOnStacks: ['osx-xcode-16.0.x'],
            },
            {
              id: 'mac-m6',
              name: 'M6',
              creditPerMinute: 32,
              ram: '256GB',
              chip: 'M6',
              cpuCount: '48',
              cpuDescription: '48 cores',
              osId: 'osx',
              availableOnStacks: ['osx-xcode-16.0.x'],
            },
          ],
        },
      });

      // Machine type options
      expect(result.machineTypePromotionMode).toBe('trial');
      expect(result.promotedMachineTypeOptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ value: 'mac-m5' }),
          expect.objectContaining({ value: 'mac-m6' }),
        ]),
      );
    });

    it('returns no promoted machine types when promotion type is undefined', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        availableStacks: stacks,
        availableMachineTypes: machines,
        projectStackId: 'osx-xcode-16',
        projectMachineTypeId: 'mac-m1',
      });

      // Machine type options
      expect(result.machineTypePromotionMode).toBeUndefined();
      expect(result.promotedMachineTypeOptions).toEqual([]);
    });

    describe('withoutDefaultOptions', () => {
      it('returns the project stack and machine type when empty stack and machine type values are selected', () => {
        const result = StackAndMachineService.prepareStackAndMachineSelectionData({
          selectedStackId: '',
          selectedMachineTypeId: '',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
          projectMachineTypeId: 'mac-m1',
          withoutDefaultOptions: true,
        });

        // Stack
        expect(result.isInvalidStack).toBe(false);
        expect(result.selectedStack).toEqual(
          expect.objectContaining({
            value: 'osx-xcode-16.0.x',
            id: 'osx-xcode-16.0.x',
            name: 'Xcode 16.0.x',
          }),
        );

        // Stack options
        expect(result.availableStackOptions).toEqual(stacks.map(StackAndMachineService.toStackOption));

        // Machine type
        expect(result.isInvalidMachineType).toBe(false);
        expect(result.selectedMachineType).toEqual(
          expect.objectContaining({ value: 'mac-m1', id: 'mac-m1', name: 'M1' }),
        );

        // Machine type options
        const selectableMachines = StackAndMachineService.getMachinesOfStack(machines, result.selectedStack);
        expect(result.availableMachineTypeOptions).toEqual(
          selectableMachines.map(StackAndMachineService.toMachineOption),
        );
      });

      it('returns the selected stack and the default machine type of the stack', () => {
        const result = StackAndMachineService.prepareStackAndMachineSelectionData({
          selectedStackId: 'osx-xcode-16.0.x',
          selectedMachineTypeId: '',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'ubuntu-jammy-22.04-bitrise-2024',
          projectMachineTypeId: 'elite',
          defaultMachineTypeIdOfOSs: {
            linux: 'elite',
            osx: 'mac-m1',
          },
          withoutDefaultOptions: true,
        });

        // Stack
        expect(result.isInvalidStack).toBe(false);
        expect(result.selectedStack).toEqual(
          expect.objectContaining({
            value: 'osx-xcode-16.0.x',
            id: 'osx-xcode-16.0.x',
            name: 'Xcode 16.0.x',
          }),
        );

        // Stack options
        expect(result.availableStackOptions).toEqual(stacks.map(StackAndMachineService.toStackOption));

        // Machine type
        expect(result.isInvalidMachineType).toBe(false);
        expect(result.selectedMachineType).toEqual(
          expect.objectContaining({ value: 'mac-m1', id: 'mac-m1', name: 'M1' }),
        );

        // Machine type options
        const selectableMachines = StackAndMachineService.getMachinesOfStack(machines, result.selectedStack);
        expect(result.availableMachineTypeOptions).toEqual(
          selectableMachines.map(StackAndMachineService.toMachineOption),
        );
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
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: '', machineTypeId: '' });
      });

      it('keeps the default stack with a compatible machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: '',
          machineTypeId: 'mac-m1',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: '', machineTypeId: 'mac-m1' });
      });

      it('keeps the default stack, but changes the incompatible machine type to default machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: '',
          machineTypeId: 'standard',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: '', machineTypeId: '' });
      });

      it('keeps a specific stack with the default machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-15.0.x',
          machineTypeId: '',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'osx-xcode-15.0.x', machineTypeId: '' });
      });

      it('keeps a specific stack with a compatible machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-15.0.x',
          machineTypeId: 'mac-m1',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({
          stackId: 'osx-xcode-15.0.x',
          machineTypeId: 'mac-m1',
        });
      });

      it('keeps a specific stack, but changes the incompatible machine type to default machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-15.0.x',
          machineTypeId: 'mac-m4',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'osx-xcode-15.0.x', machineTypeId: '' });
      });

      it('keeps the pinned default stack with the default machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-16.0.x',
          machineTypeId: '',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'osx-xcode-16.0.x', machineTypeId: '' });
      });

      it('keeps the pinned default stack with a compatible machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-16.0.x',
          machineTypeId: 'mac-m1',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({
          stackId: 'osx-xcode-16.0.x',
          machineTypeId: 'mac-m1',
        });
      });

      it('keeps the pinned default stack, but changes the incompatible machine type to default machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-16.0.x',
          machineTypeId: 'standard',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'osx-xcode-16.0.x', machineTypeId: '' });
      });
    });

    describe('stack OS changes', () => {
      it('keeps a specific stack with empty machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'ubuntu-jammy-22.04-bitrise-2024',
          machineTypeId: '',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'ubuntu-jammy-22.04-bitrise-2024', machineTypeId: '' });
      });

      it('keeps a specific stack with a compatible machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'ubuntu-jammy-22.04-bitrise-2024',
          machineTypeId: 'joker',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({
          stackId: 'ubuntu-jammy-22.04-bitrise-2024',
          machineTypeId: 'joker',
        });
      });

      it('keeps a specific stack, but changes the incompatible machine type to default machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'ubuntu-jammy-22.04-bitrise-2024',
          machineTypeId: 'mac-m4',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'ubuntu-jammy-22.04-bitrise-2024', machineTypeId: '' });
      });
    });

    describe('machineFallbackOptions', () => {
      it('keeps a specific stack with project machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-15.0.x',
          machineTypeId: '',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
          machineFallbackOptions: {
            defaultMachineTypeIdOfOSs: {
              linux: 'elite',
              osx: 'mac-m2',
            },
            projectMachineTypeId: 'mac-m1',
          },
        });

        expect(result).toEqual({
          stackId: 'osx-xcode-15.0.x',
          machineTypeId: 'mac-m1',
        });
      });

      it('keeps a specific stack with default machine type of OS', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'ubuntu-jammy-22.04-bitrise-2024',
          machineTypeId: '',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
          machineFallbackOptions: {
            defaultMachineTypeIdOfOSs: {
              linux: 'elite',
              osx: 'mac-m1',
            },
            projectMachineTypeId: 'mac-m1',
          },
        });

        expect(result).toEqual({
          stackId: 'ubuntu-jammy-22.04-bitrise-2024',
          machineTypeId: 'elite',
        });
      });

      it('keeps a specific stack with the first available machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'ubuntu-jammy-22.04-bitrise-2024',
          machineTypeId: '',
          availableStacks: stacks,
          availableMachineTypes: machines,
          projectStackId: 'osx-xcode-16.0.x',
          machineFallbackOptions: {
            defaultMachineTypeIdOfOSs: {
              linux: 'large',
              osx: 'mac-m2',
            },
            projectMachineTypeId: 'mac-m1',
          },
        });

        expect(result).toEqual({
          stackId: 'ubuntu-jammy-22.04-bitrise-2024',
          machineTypeId: 'standard',
        });
      });
    });

    describe('groupStackOptionsByStatus', () => {
      it('sorts groups according to the STACK_STATUS_ORDER', () => {
        const stackOptions: StackOption[] = [
          { value: 'stack1', label: 'Stack 1', status: 'frozen' },
          { value: 'stack2', label: 'Stack 2', status: 'stable' },
          { value: 'stack3', label: 'Stack 3', status: 'edge' },
          { value: 'stack4', label: 'Stack 4', status: 'unknown' },
        ];

        const result = StackAndMachineService.groupStackOptionsByStatus(stackOptions);

        expect(result[0].status).toBe('edge');
        expect(result[1].status).toBe('stable');
        expect(result[2].status).toBe('unknown');
        expect(result[3].status).toBe('frozen');
      });

      it('groups stack options by their status', () => {
        const stackOptions: StackOption[] = [
          { value: 'stack1', label: 'Stack 1', status: 'stable' },
          { value: 'stack2', label: 'Stack 2', status: 'stable' },
          { value: 'stack3', label: 'Stack 3', status: 'edge' },
          { value: 'stack4', label: 'Stack 4', status: 'edge' },
          { value: 'stack5', label: 'Stack 5', status: 'frozen' },
          { value: 'stack5', label: 'Stack 5', status: 'unknown' },
        ];

        const result = StackAndMachineService.groupStackOptionsByStatus(stackOptions);
        expect(result).toEqual([
          {
            status: 'edge',
            label: 'Edge Stacks',
            options: [
              { value: 'stack3', label: 'Stack 3', status: 'edge' },
              { value: 'stack4', label: 'Stack 4', status: 'edge' },
            ],
          },
          {
            status: 'stable',
            label: 'Stable Stacks',
            options: [
              { value: 'stack1', label: 'Stack 1', status: 'stable' },
              { value: 'stack2', label: 'Stack 2', status: 'stable' },
            ],
          },
          {
            status: 'unknown',
            label: 'Uncategorized',
            options: [{ value: 'stack5', label: 'Stack 5', status: 'unknown' }],
          },
          {
            status: 'frozen',
            label: 'Frozen Stacks',
            options: [{ value: 'stack5', label: 'Stack 5', status: 'frozen' }],
          },
        ]);
      });

      it('leaves out empty groups', () => {
        const stackOptions: StackOption[] = [
          { value: 'stack1', label: 'Stack 1', status: 'stable' },
          { value: 'stack2', label: 'Stack 2', status: 'stable' },
          { value: 'stack3', label: 'Stack 3', status: 'edge' },
          { value: 'stack4', label: 'Stack 4', status: 'edge' },
        ];

        const result = StackAndMachineService.groupStackOptionsByStatus(stackOptions);

        expect(result).toEqual([
          {
            status: 'edge',
            label: 'Edge Stacks',
            options: [
              { value: 'stack3', label: 'Stack 3', status: 'edge' },
              { value: 'stack4', label: 'Stack 4', status: 'edge' },
            ],
          },
          {
            status: 'stable',
            label: 'Stable Stacks',
            options: [
              { value: 'stack1', label: 'Stack 1', status: 'stable' },
              { value: 'stack2', label: 'Stack 2', status: 'stable' },
            ],
          },
        ]);
      });
    });
  });

  describe('updateStackAndMachine', () => {
    describe('root-level', () => {
      it('updates stack ID at meta.[bitrise.io]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
          `,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-16', machineTypeId: 'mac-m1', stackRollbackVersion: 'v1' },
          StackAndMachineSource.Root,
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-16
              machine_type_id: mac-m1
              stack_rollback_version: v1
        `);
      });

      it('updates machine type ID at meta.[bitrise.io]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
          `,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-15', machineTypeId: 'mac-m2', stackRollbackVersion: 'v1' },
          StackAndMachineSource.Root,
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m2
              stack_rollback_version: v1
        `);
      });

      it('updates stack rollback version at meta.[bitrise.io]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
          `,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-15', machineTypeId: 'mac-m1', stackRollbackVersion: 'v2' },
          StackAndMachineSource.Root,
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
              stack_rollback_version: v2
        `);
      });

      it('creates meta.[bitrise.io] when it does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`format_version: ''`);

        StackAndMachineService.updateStackAndMachine({ stackId: 'osx-xcode-16' }, StackAndMachineSource.Root);

        expect(getYmlString()).toEqual(yaml`
          format_version: ''
          meta:
            bitrise.io:
              stack: osx-xcode-16
        `);
      });

      it('removes stack ID from meta.[bitrise.io] when stack ID is empty', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
          `,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: '', machineTypeId: 'mac-m1', stackRollbackVersion: 'v1' },
          StackAndMachineSource.Root,
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              machine_type_id: mac-m1
              stack_rollback_version: v1
        `);
      });

      it('removes machine type ID from meta.[bitrise.io] when machine type ID is empty', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
          `,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-15', machineTypeId: '', stackRollbackVersion: 'v1' },
          StackAndMachineSource.Root,
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              stack_rollback_version: v1
        `);
      });

      it('removes stack rollback version from meta.[bitrise.io] when stack rollback version is empty', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
          `,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-15', machineTypeId: 'mac-m1', stackRollbackVersion: '' },
          StackAndMachineSource.Root,
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
        `);
      });

      it('removes meta.[bitrise.io] when its last key is removed', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            format_version: ''
            meta:
              bitrise.io:
                stack: osx-xcode-15
          `,
        );

        StackAndMachineService.updateStackAndMachine({ stackId: '' }, StackAndMachineSource.Root);

        expect(getYmlString()).toBe(yaml`format_version: ''`);
      });
    });

    describe('workflow-level override', () => {
      it('updates stack ID at workflows.[id].meta.[bitrise.io]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []`,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-16', machineTypeId: 'mac-m1' },
          StackAndMachineSource.Workflow,
          'primary',
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
              stack_rollback_version: v1
          workflows:
            primary:
              meta:
                bitrise.io:
                  stack: osx-xcode-16
                  machine_type_id: mac-m1
            test:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
            deploy:
              steps: []
        `);
      });

      it('updates machine type ID at workflows.[id].meta.[bitrise.io]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []`,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-15', machineTypeId: 'mac-m2' },
          StackAndMachineSource.Workflow,
          'primary',
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
              stack_rollback_version: v1
          workflows:
            primary:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
                  machine_type_id: mac-m2
            test:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
            deploy:
              steps: []
        `);
      });

      it('updates stack rollback version at workflows.[id].meta.[bitrise.io]', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
                    stack_rollback_version: v1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []`,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-15', machineTypeId: 'mac-m1', stackRollbackVersion: 'v2' },
          StackAndMachineSource.Workflow,
          'primary',
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
              stack_rollback_version: v1
          workflows:
            primary:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
                  machine_type_id: mac-m1
                  stack_rollback_version: v2
            test:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
            deploy:
              steps: []
        `);
      });

      it('creates workflows.[id].meta.[bitrise.io] when it does not exist', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []
          `,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-16' },
          StackAndMachineSource.Workflow,
          'deploy',
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
              stack_rollback_version: v1
          workflows:
            primary:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
                  machine_type_id: mac-m1
            test:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
            deploy:
              steps: []
              meta:
                bitrise.io:
                  stack: osx-xcode-16
        `);
      });

      it('removes stack ID at workflows.[id].meta.[bitrise.io] when stack ID is empty', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []`,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: '', machineTypeId: 'mac-m1' },
          StackAndMachineSource.Workflow,
          'primary',
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
              stack_rollback_version: v1
          workflows:
            primary:
              meta:
                bitrise.io:
                  machine_type_id: mac-m1
            test:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
            deploy:
              steps: []
        `);
      });

      it('removes machine type ID at workflows.[id].meta.[bitrise.io] when machine type ID is empty', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []`,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-15', machineTypeId: '' },
          StackAndMachineSource.Workflow,
          'primary',
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
              stack_rollback_version: v1
          workflows:
            primary:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
            test:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
            deploy:
              steps: []
        `);
      });

      it('removes stack rollback version at workflows.[id].meta.[bitrise.io] when stack rollback version is empty', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
                    stack_rollback_version: v1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []`,
        );

        StackAndMachineService.updateStackAndMachine(
          { stackId: 'osx-xcode-15', machineTypeId: 'mac-m1', stackRollbackVersion: '' },
          StackAndMachineSource.Workflow,
          'primary',
        );

        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
              stack_rollback_version: v1
          workflows:
            primary:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
                  machine_type_id: mac-m1
            test:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
            deploy:
              steps: []
        `);
      });

      it('removes workflow.[id].meta.[bitrise.io], but keeps workflow.[id] when its last key is removed', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []`,
        );
        StackAndMachineService.updateStackAndMachine({ stackId: '' }, StackAndMachineSource.Workflow, 'test');
        expect(getYmlString()).toEqual(yaml`
          meta:
            bitrise.io:
              stack: osx-xcode-15
              machine_type_id: mac-m1
              stack_rollback_version: v1
          workflows:
            primary:
              meta:
                bitrise.io:
                  stack: osx-xcode-15
                  machine_type_id: mac-m1
            test: {}
            deploy:
              steps: []
        `);
      });

      it('throws an error when source is Workflow and sourceId is not provided', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []`,
        );

        expect(() => {
          StackAndMachineService.updateStackAndMachine(
            { stackId: 'osx-xcode-16', machineTypeId: 'mac-m1', stackRollbackVersion: 'v1' },
            StackAndMachineSource.Workflow,
          );
        }).toThrow('sourceId is required when source is Workflow');
      });

      it('throws an error if the workflow does not exist', () => {
        updateBitriseYmlDocumentByString(
          yaml`
            meta:
              bitrise.io:
                stack: osx-xcode-15
                machine_type_id: mac-m1
                stack_rollback_version: v1
            workflows:
              primary:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
                    machine_type_id: mac-m1
              test:
                meta:
                  bitrise.io:
                    stack: osx-xcode-15
              deploy:
                steps: []`,
        );

        expect(() => {
          StackAndMachineService.updateStackAndMachine(
            { stackId: 'osx-xcode-16', machineTypeId: 'mac-m1', stackRollbackVersion: 'v1' },
            StackAndMachineSource.Workflow,
            'nonexistent',
          );
        }).toThrow(`Workflow nonexistent not found. Ensure that the workflow exists in the 'workflows' section.`);
      });
    });
  });
});
