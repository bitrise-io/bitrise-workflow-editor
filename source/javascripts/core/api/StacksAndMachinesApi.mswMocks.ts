import { delay, http, HttpResponse } from 'msw';

import { MachineStatus, StackStatus } from '../models/StackAndMachine';
import StacksAndMachinesApi, { MachineApiItem, MachineGroupApiItem, StackGroupApiItem } from './StacksAndMachinesApi';

type Options = {
  privateCloud?: 'no-machines' | 'machine-overrides';
  hasSelfHostedRunner?: boolean;
};

const DEFAULT_MACHINES: MachineApiItem[] = [
  {
    id: 'm1.medium',
    name: 'M1 Medium',
    chip: 'apple',
    cpu_count: '4 vCPU',
    cpu_description: '3.2GHz',
    ram: '6 GB RAM',
    credit_per_min: 2,
    os_id: 'macos',
    is_available: true,
    is_promoted: false,
    available_on_stacks: [
      'osx-xcode-16.1.x-edge',
      'osx-xcode-16.0.x-edge',
      'osx-xcode-16.0.x',
      'osx-xcode-15.0.x',
      'osx-xcode-14.3.x',
      'osx-xcode-14.2.x',
    ],
  },
  {
    id: 'standard',
    name: 'Medium',
    chip: 'intel',
    cpu_count: '4 vCPU',
    cpu_description: '3.1GHz',
    ram: '16 GB RAM',
    credit_per_min: 1,
    os_id: 'linux',
    is_available: true,
    is_promoted: false,
    available_on_stacks: ['ubuntu-noble-24.04-bitrise-2025', 'ubuntu-jammy-22.04-bitrise-2024'],
  },
];

function groupedStacks(options?: Options): StackGroupApiItem[] {
  return [
    {
      label: 'Edge Stacks',
      status: 'edge' as StackStatus,
      stacks: [
        {
          id: 'osx-xcode-16.1.x-edge',
          title: 'Xcode 16.1.x with edge updates',
          status: 'edge',
          os: 'macos',
          description:
            'Xcode 16.1 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
          available_machines:
            options?.privateCloud === 'no-machines'
              ? []
              : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large', 'm2.x-large', 'machine-y1', 'machine-y2'],
        },
        {
          id: 'osx-xcode-16.0.x-edge',
          title: 'Xcode 16.0.x with edge updates',
          status: 'edge',
          os: 'macos',
          description:
            'Xcode 16.0 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
          available_machines:
            options?.privateCloud === 'no-machines'
              ? []
              : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large', 'm2.x-large', 'machine-y1', 'machine-y2'],
        },
        {
          id: 'ubuntu-noble-24.04-bitrise-2025',
          title: 'Ubuntu Noble - Bitrise 2025 Edition',
          status: 'edge',
          os: 'linux',
          description:
            'Docker container environment based on Ubuntu 24.04. Preinstalled Android SDK and other common tools.',
          available_machines:
            options?.privateCloud === 'no-machines'
              ? []
              : [
                  'standard',
                  'intel.medium',
                  'intel.large',
                  'amd.medium',
                  'amd.large',
                  'amd.x-large',
                  'machine-x',
                  'machine-z1',
                  'machine-z2',
                ],
        },
      ],
    },
    {
      label: 'Stable Stacks',
      status: 'stable' as StackStatus,
      stacks: [
        {
          id: 'osx-xcode-16.0.x',
          title: 'Xcode 16.0.x',
          status: 'stable',
          os: 'macos',
          description:
            'Xcode 16.0 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
          available_machines:
            options?.privateCloud === 'no-machines'
              ? []
              : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large', 'm2.x-large'],
        },
        {
          id: 'osx-xcode-15.0.x',
          title: 'Xcode 15.0.x',
          status: 'stable',
          os: 'macos',
          description:
            'Xcode 15.0 based on macOS 14.1 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
          available_machines:
            options?.privateCloud === 'no-machines' ? [] : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large'],
          rollback_version: {
            'm1.medium': {
              paying: '2-82-0',
            },
            'm1.large': {
              paying: '2-82-0',
            },
            'm2.medium': {
              free: '2-82-0',
              paying: '2-82-0',
            },
            'm2.large': {
              free: '2-82-0',
              paying: '2-82-0',
            },
          },
        },
        {
          id: 'ubuntu-jammy-22.04-bitrise-2024',
          title: 'Ubuntu Jammy - Bitrise 2024 Edition',
          status: 'stable',
          os: 'linux',
          description:
            'Docker container environment based on Ubuntu 22.04. Preinstalled Android SDK and other common tools.',
          available_machines:
            options?.privateCloud === 'no-machines'
              ? []
              : ['standard', 'intel.medium', 'intel.large', 'amd.medium', 'amd.large', 'amd.x-large'],
        },
      ],
    },
    {
      label: 'Uncategorized Stacks',
      status: 'unknown' as StackStatus,
      stacks: [
        {
          id: 'mixed-stack',
          title: 'Mixed Stack',
          status: '',
          os: 'unknown',
          description: 'This is purely fictional stack, with mixed machine types.',
          available_machines:
            options?.privateCloud === 'no-machines'
              ? []
              : ['m2.medium', 'm2.large', 'm2.x-large', 'amd.medium', 'amd.large', 'amd.x-large'],
        },
      ],
    },
    {
      label: 'Frozen Stacks',
      status: 'frozen' as StackStatus,
      stacks: [
        {
          id: 'osx-xcode-14.3.x',
          title: 'Xcode 14.3.x',
          status: 'frozen',
          os: 'macos',
          description:
            'Xcode 14.3 based on macOS 13.5 Ventura.\n\nThe Android SDK and other common mobile tools are also installed.',
          available_machines:
            options?.privateCloud === 'no-machines' ? [] : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large'],
        },
        {
          id: 'osx-xcode-14.2.x',
          title: 'Xcode 14.2.x',
          status: 'frozen',
          os: 'macos',
          description:
            'Xcode 14.2 based on macOS 13.5 Ventura.\n\nThe Android SDK and other common mobile tools are also installed.',
          available_machines:
            options?.privateCloud === 'no-machines' ? [] : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large'],
        },
      ],
    },
  ];
}

function groupedMachines(options?: Options): MachineGroupApiItem[] {
  if (options?.privateCloud === 'no-machines') {
    return [];
  }

  return [
    {
      label: 'Available Machines',
      status: 'available' as MachineStatus,
      machines: [
        ...DEFAULT_MACHINES,
        {
          id: 'm1.large',
          name: 'M1 Large',
          chip: 'apple',
          cpu_count: '8 vCPU',
          cpu_description: '3.2GHz',
          ram: '12 GB RAM',
          credit_per_min: 4,
          os_id: 'macos',
          is_available: true,
          is_promoted: false,
          available_on_stacks: [
            'osx-xcode-16.1.x-edge',
            'osx-xcode-16.0.x-edge',
            'osx-xcode-16.0.x',
            'osx-xcode-15.0.x',
            'osx-xcode-14.3.x',
            'osx-xcode-14.2.x',
          ],
        },
        {
          id: 'm2.medium',
          name: 'M2 Pro Medium',
          chip: 'apple',
          cpu_count: '4 vCPU',
          cpu_description: '3.7GHz',
          ram: '6 GB RAM',
          credit_per_min: 3,
          os_id: 'macos',
          is_available: true,
          is_promoted: false,
          available_on_stacks: [
            'osx-xcode-16.1.x-edge',
            'osx-xcode-16.0.x-edge',
            'osx-xcode-16.0.x',
            'osx-xcode-15.0.x',
            'osx-xcode-14.3.x',
            'osx-xcode-14.2.x',
            'mixed-stack',
          ],
        },
        {
          id: 'm2.large',
          name: 'M2 Pro Large',
          chip: 'apple',
          cpu_count: '6 vCPU',
          cpu_description: '3.7GHz',
          ram: '14 GB RAM',
          credit_per_min: 5,
          os_id: 'macos',
          is_available: true,
          is_promoted: false,
          available_on_stacks: [
            'osx-xcode-16.1.x-edge',
            'osx-xcode-16.0.x-edge',
            'osx-xcode-16.0.x',
            'osx-xcode-15.0.x',
            'osx-xcode-14.3.x',
            'osx-xcode-14.2.x',
            'mixed-stack',
          ],
        },
        {
          id: 'm2.x-large',
          name: 'M2 Pro X Large',
          chip: 'apple',
          cpu_count: '12 vCPU',
          cpu_description: '3.7GHz',
          ram: '28 GB RAM',
          credit_per_min: 9,
          os_id: 'macos',
          is_available: true,
          is_promoted: false,
          available_on_stacks: ['osx-xcode-16.1.x-edge', 'osx-xcode-16.0.x-edge', 'osx-xcode-16.0.x', 'mixed-stack'],
        },
        {
          id: 'intel.medium',
          name: 'Intel Medium',
          chip: 'intel',
          cpu_count: '4 vCPU',
          cpu_description: '3.1GHz',
          ram: '16 GB RAM',
          credit_per_min: 1,
          os_id: 'linux',
          is_available: true,
          is_promoted: false,
          available_on_stacks: ['ubuntu-noble-24.04-bitrise-2025', 'ubuntu-jammy-22.04-bitrise-2024'],
        },
        {
          id: 'intel.large',
          name: 'Intel Large',
          chip: 'intel',
          cpu_count: '8 vCPU',
          cpu_description: '3.1GHz',
          ram: '32 GB RAM',
          credit_per_min: 2,
          os_id: 'linux',
          is_available: true,
          is_promoted: false,
          available_on_stacks: ['ubuntu-noble-24.04-bitrise-2025', 'ubuntu-jammy-22.04-bitrise-2024'],
        },
        {
          id: 'amd.medium',
          name: 'EPYC Zen4 Medium',
          chip: 'amd',
          cpu_count: '4 vCPU',
          cpu_description: '3.7GHz',
          ram: '16 GB RAM',
          credit_per_min: 1,
          os_id: 'linux',
          is_available: true,
          is_promoted: false,
          available_on_stacks: ['ubuntu-noble-24.04-bitrise-2025', 'ubuntu-jammy-22.04-bitrise-2024', 'mixed-stack'],
        },
        {
          id: 'amd.large',
          name: 'EPYC Zen4 Large',
          chip: 'amd',
          cpu_count: '8 vCPU',
          cpu_description: '3.7GHz',
          ram: '32 GB RAM',
          credit_per_min: 3,
          os_id: 'linux',
          is_available: true,
          is_promoted: false,
          available_on_stacks: ['ubuntu-noble-24.04-bitrise-2025', 'ubuntu-jammy-22.04-bitrise-2024', 'mixed-stack'],
        },
        {
          id: 'amd.x-large',
          name: 'EPYC Zen4 X Large',
          chip: 'amd',
          cpu_count: '16 vCPU',
          cpu_description: '3.7GHz',
          ram: '64 GB RAM',
          credit_per_min: 5,
          os_id: 'linux',
          is_available: true,
          is_promoted: false,
          available_on_stacks: ['ubuntu-noble-24.04-bitrise-2025', 'ubuntu-jammy-22.04-bitrise-2024', 'mixed-stack'],
        },
        {
          id: 'machine-x',
          name: 'Non Credit Machine',
          chip: 'apple',
          cpu_count: '8 vCPU',
          cpu_description: '3.7GHz',
          ram: '32 GB RAM',
          os_id: 'linux',
          is_available: true,
          is_promoted: false,
          available_on_stacks: ['ubuntu-noble-24.04-bitrise-2025'],
        },
      ],
    },
    {
      label: 'Promoted Machines',
      status: 'promoted' as MachineStatus,
      machines: [
        {
          id: 'machine-y1',
          name: 'Machine Y1 (Mac OS)',
          chip: 'apple',
          cpu_count: '8 vCPU',
          cpu_description: '3.7GHz',
          ram: '32 GB RAM',
          os_id: 'macos',
          is_available: false,
          is_promoted: true,
          available_on_stacks: ['osx-xcode-16.1.x-edge', 'osx-xcode-16.0.x-edge'],
        },
        {
          id: 'machine-y2',
          name: 'Machine Y2 (Mac OS)',
          chip: 'apple',
          cpu_count: '8 vCPU',
          cpu_description: '3.7GHz',
          ram: '32 GB RAM',
          os_id: 'macos',
          is_available: false,
          is_promoted: true,
          available_on_stacks: ['osx-xcode-16.1.x-edge', 'osx-xcode-16.0.x-edge'],
        },
        {
          id: 'machine-z1',
          name: 'Machine Z1 (Linux)',
          chip: 'amd',
          cpu_count: '8 vCPU',
          cpu_description: '3.7GHz',
          ram: '32 GB RAM',
          os_id: 'linux',
          is_available: false,
          is_promoted: true,
          available_on_stacks: ['ubuntu-noble-24.04-bitrise-2025'],
        },
        {
          id: 'machine-z2',
          name: 'Machine Z2 (Linux)',
          chip: 'amd',
          cpu_count: '8 vCPU',
          cpu_description: '3.7GHz',
          ram: '32 GB RAM',
          os_id: 'linux',
          is_available: false,
          is_promoted: true,
          available_on_stacks: ['ubuntu-noble-24.04-bitrise-2025'],
        },
      ],
    },
  ];
}

export const getStacksAndMachines = (options?: Options) => {
  return http.get(StacksAndMachinesApi.getStacksAndMachinesPath(':appSlug'), async () => {
    await delay();

    return HttpResponse.json({
      running_builds_on_private_cloud: Boolean(options?.privateCloud),
      has_self_hosted_runner: Boolean(options?.hasSelfHostedRunner),
      default_stack_id: 'osx-xcode-16.0.x',
      default_machine_id: 'm2.x-large',
      default_machines: DEFAULT_MACHINES,
      grouped_stacks: groupedStacks(options),
      grouped_machines: groupedMachines(options),
    });
  });
};
