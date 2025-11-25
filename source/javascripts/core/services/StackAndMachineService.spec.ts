import { MachineType, MachineTypeGroup, Stack, StackGroup } from '@/core/models/StackAndMachine';
import StackAndMachineService, { StackAndMachineSource } from '@/core/services/StackAndMachineService';

import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';

const stacks: Stack[] = [
  {
    id: 'osx-xcode-16.1.x',
    name: 'Xcode 16.1.x',
    status: 'edge',
    description:
      'Xcode 16.1 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
    machineTypes: ['mac-m1', 'mac-m2', 'mac-m3', 'mac-m4', 'joker'],
    os: 'macos',
  },
  {
    id: 'osx-xcode-16.0.x',
    name: 'Xcode 16.0.x',
    status: 'stable',
    description:
      'Xcode 16.0 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
    machineTypes: ['mac-m1', 'mac-m2', 'mac-m3', 'mac-m4'],
    os: 'macos',
  },
  {
    id: 'osx-xcode-15.0.x',
    name: 'Xcode 15.0.x',
    status: 'stable',
    description:
      'Xcode 15.0.1 based on macOS 13.5 Ventura.\n\nThe Android SDK and other common mobile tools are also installed.',
    machineTypes: ['mac-m1', 'mac-m2'],
    os: 'macos',
  },
  {
    id: 'osx-xcode-14.0.x',
    name: 'Xcode 14.0.x',
    status: 'frozen',
    description:
      'Xcode 14.1.1 based on macOS 13.5 Ventura.\n\nThe Android SDK and other common mobile tools are also installed.',
    machineTypes: ['mac-m1', 'mac-m2'],
    os: 'macos',
  },
  {
    id: 'ubuntu-jammy-22.04-bitrise-2024',
    name: 'Ubuntu Jammy - Bitrise 2024 Edition',
    status: 'edge',
    description: 'Docker container environment based on Ubuntu 22.04. Preinstalled Android SDK and other common tools.',
    machineTypes: ['standard', 'elite', 'joker'],
    os: 'linux',
  },
  {
    id: 'ubuntu-focal-20.04-bitrise-2024',
    name: 'Ubuntu Focal - Bitrise 2024 Edition',
    status: 'stable',
    description: 'Docker container environment based on Ubuntu 2-.04. Preinstalled Android SDK and other common tools.',
    machineTypes: ['standard', 'elite'],
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

const groupedStacks: StackGroup[] = [
  {
    label: 'Edge Stacks',
    status: 'edge',
    stacks: stacks.filter((stack) => stack.status === 'edge'),
  },
  {
    label: 'Stable Stacks',
    status: 'stable',
    stacks: stacks.filter((stack) => stack.status === 'stable'),
  },
  {
    label: 'Uncategorized Stacks',
    status: 'unknown',
    stacks: stacks.filter((stack) => stack.status === 'unknown'),
  },
  {
    label: 'Frozen Stacks',
    status: 'frozen',
    stacks: stacks.filter((stack) => stack.status === 'frozen'),
  },
];

const machines: MachineType[] = [
  {
    id: 'standard',
    name: 'Standard',
    creditPerMinute: 1,
    availableInRegions: {
      'region-us': {
        name: 'Standard',
        ram: '8GB',
        cpuCount: '4 CPU',
        cpuDescription: '3.5 GHz',
      },
    },
    os: 'linux',
    isPromoted: false,
    availableOnStacks: ['ubuntu-jammy-22.04-bitrise-2024', 'ubuntu-focal-20.04-bitrise-2024'],
  },
  {
    id: 'elite',
    name: 'Elite',
    creditPerMinute: 1,
    availableInRegions: {
      'region-us': {
        name: 'Elite',
        ram: '16GB',
        cpuCount: '8 CPU',
        cpuDescription: '4.0 GHz',
      },
    },
    os: 'linux',
    isPromoted: false,
    availableOnStacks: ['ubuntu-jammy-22.04-bitrise-2024', 'ubuntu-focal-20.04-bitrise-2024'],
  },
  {
    id: 'mac-m1',
    name: 'M1',
    creditPerMinute: 2,
    availableInRegions: {
      'region-us': {
        name: 'M1',
        ram: '16GB',
        cpuCount: '8 CPU',
        cpuDescription: '3.5 GHz',
      },
    },
    os: 'macos',
    isPromoted: false,
    availableOnStacks: ['osx-xcode-16.1.x', 'osx-xcode-16.0.x', 'osx-xcode-15.0.x', 'osx-xcode-14.0.x'],
  },
  {
    id: 'mac-m2',
    name: 'M2',
    creditPerMinute: 3,
    availableInRegions: {
      'region-us': {
        name: 'M2',
        ram: '24GB',
        cpuCount: '12 CPU',
        cpuDescription: '4.0 GHz',
      },
    },
    os: 'macos',
    isPromoted: false,
    availableOnStacks: ['osx-xcode-16.1.x', 'osx-xcode-16.0.x', 'osx-xcode-15.0.x', 'osx-xcode-14.0.x'],
  },
  {
    id: 'mac-m3',
    name: 'M3',
    creditPerMinute: 4,
    availableInRegions: {
      'region-us': {
        name: 'M3',
        ram: '32GB',
        cpuCount: '16 CPU',
        cpuDescription: '4.5 GHz',
      },
    },
    os: 'macos',
    isPromoted: false,
    availableOnStacks: ['osx-xcode-16.1.x', 'osx-xcode-16.0.x'],
  },
  {
    id: 'mac-m4',
    name: 'M4',
    creditPerMinute: 8,
    availableInRegions: {
      'region-us': {
        name: 'M4',
        ram: '64GB',
        cpuCount: '24 CPU',
        cpuDescription: '4.5 GHz',
      },
    },
    os: 'macos',
    isPromoted: true,
    availableOnStacks: ['osx-xcode-16.1.x', 'osx-xcode-16.0.x'],
  },
  {
    id: 'linux-xl',
    name: 'XL',
    creditPerMinute: 8,
    availableInRegions: {
      'region-us': {
        name: 'XL',
        ram: '64GB',
        cpuCount: '32 CPU',
        cpuDescription: '4.5 GHz',
      },
    },
    os: 'linux',
    isPromoted: true,
    availableOnStacks: undefined,
  },
  {
    id: 'joker',
    name: 'Joker',
    creditPerMinute: 16,
    availableInRegions: {
      'region-us': {
        name: 'Joker',
        ram: '128GB',
        cpuCount: '64 CPU',
        cpuDescription: '5.0 GHz',
      },
    },
    os: 'unknown',
    isPromoted: true,
    availableOnStacks: undefined,
  },
];

const groupedMachines: MachineTypeGroup[] = [
  {
    label: 'Available on your plan',
    status: 'available',
    machines: machines.filter((machine) => !machine.isPromoted),
  },
  {
    label: 'Available on other plans',
    status: 'promoted',
    machines: machines.filter((machine) => machine.isPromoted),
  },
];

const defaultMachines: MachineType[] = machines.filter(
  (machine) => machine.id === 'mac-m1' || machine.id === 'standard',
);

describe('StackAndMachineService', () => {
  describe('prepareStackAndMachineSelectionData', () => {
    it('returns the default stack when empty stack value is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-15.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: '', id: 'osx-xcode-15.0.x', name: 'Xcode 15.0.x' }),
      );
      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: 'mac-m1', name: 'M1' }));

      // Stack options
      expect(result.stackOptionGroups).toEqual([
        {
          label: 'Default Stack',
          status: 'stable',
          options: [{ value: '', label: 'Default (Xcode 15.0.x)', status: 'stable', os: 'macos' }],
        },
        {
          label: 'Edge Stacks',
          status: 'edge',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'edge')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Stable Stacks',
          status: 'stable',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'stable')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Uncategorized Stacks',
          status: 'unknown',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'unknown')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Frozen Stacks',
          status: 'frozen',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'frozen')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
      ]);

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Default Machine',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Default (M1)',
              status: 'available',
            },
          ],
        },
        {
          label: 'Available on your plan',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              label: 'M1 (2 credits/min)',
              status: 'available',
              value: 'mac-m1',
            },
            {
              machineType: expect.any(Object),
              label: 'M2 (3 credits/min)',
              status: 'available',
              value: 'mac-m2',
            },
          ],
        },
      ]);
    });

    it('returns the selected stack when a valid stack is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: 'osx-xcode-15.0.x',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: 'osx-xcode-15.0.x', id: 'osx-xcode-15.0.x', name: 'Xcode 15.0.x' }),
      );
      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: 'mac-m1', name: 'M1' }));

      // Stack options
      expect(result.stackOptionGroups).toEqual([
        {
          label: 'Default Stack',
          status: 'stable',
          options: [{ value: '', label: 'Default (Xcode 16.0.x)', status: 'stable', os: 'macos' }],
        },
        {
          label: 'Edge Stacks',
          status: 'edge',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'edge')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Stable Stacks',
          status: 'stable',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'stable')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Uncategorized Stacks',
          status: 'unknown',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'unknown')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Frozen Stacks',
          status: 'frozen',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'frozen')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
      ]);

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Default Machine',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Default (M1)',
              status: 'available',
            },
          ],
        },
        {
          label: 'Available on your plan',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              label: 'M1 (2 credits/min)',
              status: 'available',
              value: 'mac-m1',
            },
            {
              machineType: expect.any(Object),
              label: 'M2 (3 credits/min)',
              status: 'available',
              value: 'mac-m2',
            },
          ],
        },
      ]);
    });

    it('returns the invalid stack when an invalid stack is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: 'osx-xcode-11',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-15.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      expect(result.isInvalidStack).toBe(true);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: 'osx-xcode-11', id: 'osx-xcode-11', name: 'Invalid Stack (osx-xcode-11)' }),
      );
      expect(result.isInvalidMachineType).toBe(true);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({ value: '', id: '', name: 'Invalid Machine' }),
      );

      // Stack options
      expect(result.stackOptionGroups).toEqual([
        {
          label: 'Invalid Stack',
          status: 'unknown',
          options: [{ value: 'osx-xcode-11', label: 'Invalid Stack (osx-xcode-11)', status: 'unknown', os: 'unknown' }],
        },
        {
          label: 'Default Stack',
          status: 'stable',
          options: [{ label: 'Default (Xcode 15.0.x)', value: '', status: 'stable', os: 'macos' }],
        },
        {
          label: 'Edge Stacks',
          status: 'edge',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'edge')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Stable Stacks',
          status: 'stable',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'stable')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Uncategorized Stacks',
          status: 'unknown',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'unknown')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Frozen Stacks',
          status: 'frozen',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'frozen')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
      ]);

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Invalid Machine',
          status: 'unknown',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Invalid Machine',
              status: 'unknown',
            },
          ],
        },
      ]);
    });

    it('returns the invalid default stack when stack is not selected and default stack is invalid', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: 'mac-m1',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-11',
        projectMachineTypeId: 'mac-m1',
      });

      expect(result.isInvalidStack).toBe(true);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: '', id: '', name: 'Invalid Default Stack (osx-xcode-11)' }),
      );
      expect(result.isInvalidMachineType).toBe(true);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({ value: 'mac-m1', id: 'mac-m1', name: 'Invalid Machine' }),
      );

      // Stack options
      expect(result.stackOptionGroups).toEqual([
        {
          label: 'Invalid Stack',
          status: 'unknown',
          options: [{ value: '', label: 'Invalid Default Stack (osx-xcode-11)', status: 'unknown', os: 'unknown' }],
        },
        {
          label: 'Edge Stacks',
          status: 'edge',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'edge')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Stable Stacks',
          status: 'stable',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'stable')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Uncategorized Stacks',
          status: 'unknown',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'unknown')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Frozen Stacks',
          status: 'frozen',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'frozen')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
      ]);

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Invalid Machine',
          status: 'unknown',
          options: [
            {
              machineType: expect.any(Object),
              value: 'mac-m1',
              label: 'Invalid Machine',
              status: 'unknown',
            },
          ],
        },
      ]);
    });

    it('returns the default machine type when empty machine type value is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-15.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: '', id: 'osx-xcode-15.0.x', name: 'Xcode 15.0.x' }),
      );

      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: 'mac-m1', name: 'M1' }));

      // Stack options
      expect(result.stackOptionGroups).toEqual([
        {
          label: 'Default Stack',
          status: 'stable',
          options: [{ value: '', label: 'Default (Xcode 15.0.x)', status: 'stable', os: 'macos' }],
        },
        {
          label: 'Edge Stacks',
          status: 'edge',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'edge')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Stable Stacks',
          status: 'stable',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'stable')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Uncategorized Stacks',
          status: 'unknown',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'unknown')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Frozen Stacks',
          status: 'frozen',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'frozen')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
      ]);

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Default Machine',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Default (M1)',
              status: 'available',
            },
          ],
        },
        {
          label: 'Available on your plan',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              label: 'M1 (2 credits/min)',
              status: 'available',
              value: 'mac-m1',
            },
            {
              machineType: expect.any(Object),
              label: 'M2 (3 credits/min)',
              status: 'available',
              value: 'mac-m2',
            },
          ],
        },
      ]);
    });

    it('returns the selected machine type when a valid machine type is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: 'mac-m2',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-15.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: '', id: 'osx-xcode-15.0.x', name: 'Xcode 15.0.x' }),
      );

      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({ value: 'mac-m2', id: 'mac-m2', name: 'M2' }),
      );

      // Stack options
      expect(result.stackOptionGroups).toEqual([
        {
          label: 'Default Stack',
          status: 'stable',
          options: [{ value: '', label: 'Default (Xcode 15.0.x)', status: 'stable', os: 'macos' }],
        },
        {
          label: 'Edge Stacks',
          status: 'edge',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'edge')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Stable Stacks',
          status: 'stable',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'stable')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Uncategorized Stacks',
          status: 'unknown',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'unknown')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Frozen Stacks',
          status: 'frozen',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'frozen')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
      ]);

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Default Machine',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Default (M1)',
              status: 'available',
            },
          ],
        },
        {
          label: 'Available on your plan',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: 'mac-m1',
              label: 'M1 (2 credits/min)',
              status: 'available',
            },
            {
              machineType: expect.any(Object),
              value: 'mac-m2',
              label: 'M2 (3 credits/min)',
              status: 'available',
            },
          ],
        },
      ]);
    });

    it('returns the invalid machine type when an invalid machine type is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: 'mac-intel',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-15.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: '', id: 'osx-xcode-15.0.x', name: 'Xcode 15.0.x' }),
      );

      expect(result.isInvalidMachineType).toBe(true);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({ value: 'mac-intel', id: 'mac-intel', name: 'Invalid Machine (mac-intel)' }),
      );

      // Stack options
      expect(result.stackOptionGroups).toEqual([
        {
          label: 'Default Stack',
          status: 'stable',
          options: [
            {
              value: '',
              label: 'Default (Xcode 15.0.x)',
              status: 'stable',
              os: 'macos',
            },
          ],
        },
        {
          label: 'Edge Stacks',
          status: 'edge',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'edge')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Stable Stacks',
          status: 'stable',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'stable')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Uncategorized Stacks',
          status: 'unknown',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'unknown')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Frozen Stacks',
          status: 'frozen',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'frozen')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
      ]);

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Invalid Machine',
          status: 'unknown',
          options: [
            {
              machineType: expect.any(Object),
              value: 'mac-intel',
              label: 'Invalid Machine (mac-intel)',
              status: 'unknown',
            },
          ],
        },
        {
          label: 'Default Machine',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Default (M1)',
              status: 'available',
            },
          ],
        },
        {
          label: 'Available on your plan',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: 'mac-m1',
              label: 'M1 (2 credits/min)',
              status: 'available',
            },
            {
              machineType: expect.any(Object),
              value: 'mac-m2',
              label: 'M2 (3 credits/min)',
              status: 'available',
            },
          ],
        },
      ]);
    });

    it('returns the invalid default machine type when machine type is not selected and default machine is invalid', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-15.0.x',
        projectMachineTypeId: 'mac-intel',
      });

      expect(result.isInvalidMachineType).toBe(true);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({ value: '', id: '', name: 'Invalid Default Machine (mac-intel)' }),
      );

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Invalid Machine',
          status: 'unknown',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Invalid Default Machine (mac-intel)',
              status: 'unknown',
            },
          ],
        },
        {
          label: 'Available on your plan',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: 'mac-m1',
              label: 'M1 (2 credits/min)',
              status: 'available',
            },
            {
              machineType: expect.any(Object),
              value: 'mac-m2',
              label: 'M2 (3 credits/min)',
              status: 'available',
            },
          ],
        },
      ]);
    });

    it('returns self-hosted runner when agent pool is selected', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: 'agent-pool-stack',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-15.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: 'agent-pool-stack', id: 'agent-pool-stack', name: 'Self-hosted agent' }),
      );

      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({ value: '', id: '', name: 'Self-Hosted Runner' }),
      );

      // Stack options
      expect(result.stackOptionGroups).toEqual([
        {
          label: 'Default Stack',
          status: 'stable',
          options: [{ value: '', label: 'Default (Xcode 15.0.x)', status: 'stable', os: 'macos' }],
        },
        {
          label: 'Edge Stacks',
          status: 'edge',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'edge')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Stable Stacks',
          status: 'stable',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'stable')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Uncategorized Stacks',
          status: 'unknown',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'unknown')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Frozen Stacks',
          status: 'frozen',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'frozen')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
      ]);

      // Machine type options
      expect(result.isMachineTypeSelectionDisabled).toBe(true);
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Self-Hosted Runner',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Self-Hosted Runner',
              status: 'available',
            },
          ],
        },
      ]);
    });

    it('returns machines for dedicated accounts with available machines', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-15.0.x',
        projectMachineTypeId: 'mac-m1',
        runningBuildsOnPrivateCloud: true,
      });

      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: '', id: 'osx-xcode-15.0.x', name: 'Xcode 15.0.x' }),
      );

      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(expect.objectContaining({ value: '', id: 'mac-m1', name: 'M1' }));

      // Stack options
      expect(result.stackOptionGroups).toEqual([
        {
          label: 'Default Stack',
          status: 'stable',
          options: [{ value: '', label: 'Default (Xcode 15.0.x)', status: 'stable', os: 'macos' }],
        },
        {
          label: 'Edge Stacks',
          status: 'edge',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'edge')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Stable Stacks',
          status: 'stable',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'stable')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Uncategorized Stacks',
          status: 'unknown',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'unknown')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
        {
          label: 'Frozen Stacks',
          status: 'frozen',
          options: groupedStacks
            .filter((stackGroup) => stackGroup.status === 'frozen')
            .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
        },
      ]);

      // Machine type options
      expect(result.isMachineTypeSelectionDisabled).toBe(false);
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Default Machine',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Default (M1)',
              status: 'available',
            },
          ],
        },
        {
          label: 'Available on your plan',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              label: 'M1 (2 credits/min)',
              status: 'available',
              value: 'mac-m1',
            },
            {
              machineType: expect.any(Object),
              label: 'M2 (3 credits/min)',
              status: 'available',
              value: 'mac-m2',
            },
          ],
        },
      ]);
    });

    it('returns disabled selection for dedicated accounts with no available machines', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines: [],
        defaultMachines,
        projectStackId: 'osx-xcode-15.0.x',
        projectMachineTypeId: 'mac-m1',
        runningBuildsOnPrivateCloud: true,
      });

      expect(result.isInvalidStack).toBe(false);
      expect(result.selectedStack).toEqual(
        expect.objectContaining({ value: '', id: 'osx-xcode-15.0.x', name: 'Xcode 15.0.x' }),
      );

      expect(result.isInvalidMachineType).toBe(false);
      expect(result.selectedMachineType).toEqual(
        expect.objectContaining({
          value: '',
          id: '',
          name: 'Dedicated Machine',
        }),
      );

      // Machine type options
      expect(result.isMachineTypeSelectionDisabled).toBe(true);
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Dedicated Machine',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Dedicated Machine',
              status: 'available',
            },
          ],
        },
      ]);
    });

    it('returns promoted machine types when available', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines,
        defaultMachines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Default Machine',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Default (M1)',
              status: 'available',
            },
          ],
        },
        {
          label: 'Available on your plan',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              label: 'M1 (2 credits/min)',
              status: 'available',
              value: 'mac-m1',
            },
            {
              machineType: expect.any(Object),
              label: 'M2 (3 credits/min)',
              status: 'available',
              value: 'mac-m2',
            },
            {
              machineType: expect.any(Object),
              label: 'M3 (4 credits/min)',
              status: 'available',
              value: 'mac-m3',
            },
          ],
        },
        {
          label: 'Available on other plans',
          status: 'promoted',
          options: [
            {
              machineType: expect.any(Object),
              label: 'M4 (8 credits/min)',
              status: 'promoted',
              value: 'mac-m4',
            },
          ],
        },
      ]);
    });

    it('returns no promoted machine group, when there are no promoted machines', () => {
      const result = StackAndMachineService.prepareStackAndMachineSelectionData({
        selectedStackId: '',
        selectedMachineTypeId: '',
        groupedStacks,
        groupedMachines: groupedMachines.filter((group) => group.status !== 'promoted'),
        defaultMachines,
        projectStackId: 'osx-xcode-16.0.x',
        projectMachineTypeId: 'mac-m1',
      });

      // Machine type options
      expect(result.machineOptionGroups).toEqual([
        {
          label: 'Default Machine',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              value: '',
              label: 'Default (M1)',
              status: 'available',
            },
          ],
        },
        {
          label: 'Available on your plan',
          status: 'available',
          options: [
            {
              machineType: expect.any(Object),
              label: 'M1 (2 credits/min)',
              status: 'available',
              value: 'mac-m1',
            },
            {
              machineType: expect.any(Object),
              label: 'M2 (3 credits/min)',
              status: 'available',
              value: 'mac-m2',
            },
            {
              machineType: expect.any(Object),
              label: 'M3 (4 credits/min)',
              status: 'available',
              value: 'mac-m3',
            },
          ],
        },
      ]);
    });

    describe('withoutDefaultOptions', () => {
      it('returns the project stack and machine type when empty stack and machine type values are selected', () => {
        const result = StackAndMachineService.prepareStackAndMachineSelectionData({
          selectedStackId: '',
          selectedMachineTypeId: '',
          groupedStacks,
          groupedMachines,
          defaultMachines,
          projectStackId: 'osx-xcode-16.0.x',
          projectMachineTypeId: 'mac-m1',
          withoutDefaultOptions: true,
        });

        expect(result.isInvalidStack).toBe(false);
        expect(result.selectedStack).toEqual(
          expect.objectContaining({ value: 'osx-xcode-16.0.x', id: 'osx-xcode-16.0.x', name: 'Xcode 16.0.x' }),
        );

        expect(result.isInvalidMachineType).toBe(false);
        expect(result.selectedMachineType).toEqual(
          expect.objectContaining({
            value: 'mac-m1',
            id: 'mac-m1',
            name: 'M1',
          }),
        );

        // Stack options
        expect(result.stackOptionGroups).toEqual([
          {
            label: 'Edge Stacks',
            status: 'edge',
            options: groupedStacks
              .filter((stackGroup) => stackGroup.status === 'edge')
              .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
          },
          {
            label: 'Stable Stacks',
            status: 'stable',
            options: groupedStacks
              .filter((stackGroup) => stackGroup.status === 'stable')
              .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
          },
          {
            label: 'Uncategorized Stacks',
            status: 'unknown',
            options: groupedStacks
              .filter((stackGroup) => stackGroup.status === 'unknown')
              .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
          },
          {
            label: 'Frozen Stacks',
            status: 'frozen',
            options: groupedStacks
              .filter((stackGroup) => stackGroup.status === 'frozen')
              .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
          },
        ]);

        // Machine type options
        expect(result.machineOptionGroups).toEqual([
          {
            label: 'Available on your plan',
            status: 'available',
            options: [
              {
                machineType: expect.any(Object),
                label: 'M1 (2 credits/min)',
                status: 'available',
                value: 'mac-m1',
              },
              {
                machineType: expect.any(Object),
                label: 'M2 (3 credits/min)',
                status: 'available',
                value: 'mac-m2',
              },
              {
                machineType: expect.any(Object),
                label: 'M3 (4 credits/min)',
                status: 'available',
                value: 'mac-m3',
              },
            ],
          },
          {
            label: 'Available on other plans',
            status: 'promoted',
            options: [
              {
                machineType: expect.any(Object),
                label: 'M4 (8 credits/min)',
                status: 'promoted',
                value: 'mac-m4',
              },
            ],
          },
        ]);
      });

      it('returns the selected stack and the default machine type of the stack', () => {
        const result = StackAndMachineService.prepareStackAndMachineSelectionData({
          selectedStackId: 'osx-xcode-16.0.x',
          selectedMachineTypeId: '',
          groupedStacks,
          groupedMachines,
          defaultMachines,
          projectStackId: 'ubuntu-jammy-22.04-bitrise-2024',
          projectMachineTypeId: 'elite',
          withoutDefaultOptions: true,
        });

        expect(result.isInvalidStack).toBe(false);
        expect(result.selectedStack).toEqual(
          expect.objectContaining({ value: 'osx-xcode-16.0.x', id: 'osx-xcode-16.0.x', name: 'Xcode 16.0.x' }),
        );

        expect(result.isInvalidMachineType).toBe(false);
        expect(result.selectedMachineType).toEqual(
          expect.objectContaining({ value: 'mac-m1', id: 'mac-m1', name: 'M1' }),
        );

        // Stack options
        expect(result.stackOptionGroups).toEqual([
          {
            label: 'Edge Stacks',
            status: 'edge',
            options: groupedStacks
              .filter((stackGroup) => stackGroup.status === 'edge')
              .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
          },
          {
            label: 'Stable Stacks',
            status: 'stable',
            options: groupedStacks
              .filter((stackGroup) => stackGroup.status === 'stable')
              .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
          },
          {
            label: 'Uncategorized Stacks',
            status: 'unknown',
            options: groupedStacks
              .filter((stackGroup) => stackGroup.status === 'unknown')
              .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
          },
          {
            label: 'Frozen Stacks',
            status: 'frozen',
            options: groupedStacks
              .filter((stackGroup) => stackGroup.status === 'frozen')
              .flatMap((stackGroup) => stackGroup.stacks.map(StackAndMachineService.toStackOption)),
          },
        ]);

        // Machine type options
        expect(result.machineOptionGroups).toEqual([
          {
            label: 'Available on your plan',
            status: 'available',
            options: [
              {
                machineType: expect.any(Object),
                label: 'M1 (2 credits/min)',
                status: 'available',
                value: 'mac-m1',
              },
              {
                machineType: expect.any(Object),
                label: 'M2 (3 credits/min)',
                status: 'available',
                value: 'mac-m2',
              },
              {
                machineType: expect.any(Object),
                label: 'M3 (4 credits/min)',
                status: 'available',
                value: 'mac-m3',
              },
            ],
          },
          {
            label: 'Available on other plans',
            status: 'promoted',
            options: [
              {
                machineType: expect.any(Object),
                label: 'M4 (8 credits/min)',
                status: 'promoted',
                value: 'mac-m4',
              },
            ],
          },
        ]);
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
          availableMachines: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: '', machineTypeId: '' });
      });

      it('keeps the default stack with a compatible machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: '',
          machineTypeId: 'mac-m1',
          availableStacks: stacks,
          availableMachines: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: '', machineTypeId: 'mac-m1' });
      });

      it('keeps the default stack, but changes the incompatible machine type to default machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: '',
          machineTypeId: 'standard',
          availableStacks: stacks,
          availableMachines: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: '', machineTypeId: '' });
      });

      it('keeps a specific stack with the default machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-15.0.x',
          machineTypeId: '',
          availableStacks: stacks,
          availableMachines: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'osx-xcode-15.0.x', machineTypeId: '' });
      });

      it('keeps a specific stack with a compatible machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-15.0.x',
          machineTypeId: 'mac-m1',
          availableStacks: stacks,
          availableMachines: machines,
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
          availableMachines: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'osx-xcode-15.0.x', machineTypeId: '' });
      });

      it('keeps the pinned default stack with the default machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-16.0.x',
          machineTypeId: '',
          availableStacks: stacks,
          availableMachines: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'osx-xcode-16.0.x', machineTypeId: '' });
      });

      it('keeps the pinned default stack with a compatible machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'osx-xcode-16.0.x',
          machineTypeId: 'mac-m1',
          availableStacks: stacks,
          availableMachines: machines,
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
          availableMachines: machines,
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
          availableMachines: machines,
          projectStackId: 'osx-xcode-16.0.x',
        });

        expect(result).toEqual({ stackId: 'ubuntu-jammy-22.04-bitrise-2024', machineTypeId: '' });
      });

      it('keeps a specific stack with a compatible machine type', () => {
        const result = StackAndMachineService.changeStackAndMachine({
          stackId: 'ubuntu-jammy-22.04-bitrise-2024',
          machineTypeId: 'joker',
          availableStacks: stacks,
          availableMachines: machines,
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
          availableMachines: machines,
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
          availableMachines: machines,
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
          availableMachines: machines,
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
          availableMachines: machines,
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
