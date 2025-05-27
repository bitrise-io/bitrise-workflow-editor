import { delay, http, HttpResponse } from 'msw';

import StacksAndMachinesApi, { StacksAndMachinesResponse } from './StacksAndMachinesApi';

type Options = {
  privateCloud?: 'no-machines' | 'machine-overrides';
  hasSelfHostedRunner?: boolean;
};

export const getStacksAndMachines = (options?: Options) => {
  return http.get(StacksAndMachinesApi.getStacksAndMachinesPath(':appSlug'), async () => {
    await delay();

    const availableStacks: Record<
      string,
      {
        title: string;
        status: string;
        description?: string;
        available_machines?: string[];
        rollback_version?: any;
      }
    > = {
      'osx-xcode-16.1.x-edge': {
        title: 'Xcode 16.1.x with edge updates',
        status: 'edge',
        description:
          'Xcode 16.1 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
        available_machines:
          options?.privateCloud === 'no-machines'
            ? []
            : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large', 'm2.x-large'],
      },
      'osx-xcode-16.0.x-edge': {
        title: 'Xcode 16.0.x with edge updates',
        status: 'edge',
        description:
          'Xcode 16.0 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
        available_machines:
          options?.privateCloud === 'no-machines'
            ? []
            : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large', 'm2.x-large', 'machine-y1', 'machine-y2'],
      },
      'osx-xcode-16.0.x': {
        title: 'Xcode 16.0.x',
        status: 'stable',
        description:
          'Xcode 16.0 based on macOS 14.5 Sonoma.\n\nThe Android SDK and other common mobile tools are also installed.',
        available_machines:
          options?.privateCloud === 'no-machines'
            ? []
            : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large', 'm2.x-large'],
      },
      'osx-xcode-15.0.x': {
        title: 'Xcode 15.0.x',
        status: 'stable',
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
      'osx-xcode-14.3.x': {
        title: 'Xcode 14.3.x',
        status: 'frozen',
        description:
          'Xcode 14.3 based on macOS 13.5 Ventura.\n\nThe Android SDK and other common mobile tools are also installed.',
        available_machines:
          options?.privateCloud === 'no-machines' ? [] : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large'],
      },
      'osx-xcode-14.2.x': {
        title: 'Xcode 14.2.x',
        status: 'frozen',
        description:
          'Xcode 14.2 based on macOS 13.5 Ventura.\n\nThe Android SDK and other common mobile tools are also installed.',
        available_machines:
          options?.privateCloud === 'no-machines' ? [] : ['m1.medium', 'm1.large', 'm2.medium', 'm2.large'],
      },
      'ubuntu-jammy-22.04-bitrise-2024': {
        title: 'Ubuntu Jammy - 2024 Edition',
        status: 'stable',
        description:
          'Docker container environment based on Ubuntu 22.04. Preinstalled Android SDK and other common tools.',
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
              ],
      },
      'ubuntu-noble-24.04-bitrise-2025': {
        title: 'Ubuntu Noble - 2025 Edition',
        status: 'edge',
        description:
          'Docker container environment based on Ubuntu 24.04. Preinstalled Android SDK and other common tools.',
        available_machines:
          options?.privateCloud === 'no-machines'
            ? []
            : ['standard', 'intel.medium', 'intel.large', 'amd.medium', 'amd.large', 'amd.x-large', 'machine-x'],
      },
      'mixed-stack': {
        title: 'Mixed Stack',
        status: '',
        description: 'This is purely fictional stack, with mixed machine types.',
        available_machines:
          options?.privateCloud === 'no-machines'
            ? []
            : ['m2.medium', 'm2.large', 'm2.x-large', 'amd.medium', 'amd.large', 'amd.x-large'],
      },
    };

    if (options?.hasSelfHostedRunner) {
      availableStacks['agent-pool-stack'] = {
        title: 'Self-Hosted Runner: First Pool',
        status: 'unknown',
      };
    }

    return HttpResponse.json({
      running_builds_on_private_cloud: Boolean(options?.privateCloud),
      has_self_hosted_runner: Boolean(options?.hasSelfHostedRunner),
      default_stack_id: 'osx-xcode-16.0.x',
      default_machine_id: 'm2.x-large',
      available_stacks: availableStacks,
      available_machines:
        options?.privateCloud === 'no-machines'
          ? {}
          : {
              osx: {
                default_machine_type: 'm2.medium',
                machine_types: {
                  'm1.medium': {
                    available_on_stacks: ['osx-xcode-15', 'osx-xcode-16'],
                    name: 'M1 Medium',
                    chip: 'apple',
                    cpu_count: '4 vCPU',
                    cpu_description: '3.2GHz',
                    ram: '6 GB RAM',
                    credit_per_min: 2,
                  },
                  'm1.large': {
                    available_on_stacks: ['osx-xcode-15', 'osx-xcode-16'],
                    name: 'M1 Large',
                    chip: 'apple',
                    cpu_count: '8 vCPU',
                    cpu_description: '3.2GHz',
                    ram: '12 GB RAM',
                    credit_per_min: 4,
                  },
                  'm2.medium': {
                    available_on_stacks: ['osx-xcode-15', 'osx-xcode-16', 'mixed-stack'],
                    name: 'M2 Pro Medium',
                    chip: 'apple',
                    cpu_count: '4 vCPU',
                    cpu_description: '3.7GHz',
                    ram: '6 GB RAM',
                    credit_per_min: 3,
                  },
                  'm2.large': {
                    available_on_stacks: ['osx-xcode-15', 'osx-xcode-16', 'mixed-stack'],
                    name: 'M2 Pro Large',
                    chip: 'apple',
                    cpu_count: '6 vCPU',
                    cpu_description: '3.7GHz',
                    ram: '14 GB RAM',
                    credit_per_min: 5,
                  },
                  'm2.x-large': {
                    available_on_stacks: ['osx-xcode-16', 'mixed-stack'],
                    name: 'M2 Pro X Large',
                    chip: 'apple',
                    cpu_count: '12 vCPU',
                    cpu_description: '3.7GHz',
                    ram: '28 GB RAM',
                    credit_per_min: 9,
                  },
                },
              },
              linux: {
                default_machine_type: 'amd.large',
                machine_types: {
                  standard: {
                    available_on_stacks: ['linux-ubuntu-22.04'],
                    name: 'Medium',
                    chip: 'intel',
                    cpu_count: '4 vCPU',
                    cpu_description: '3.1GHz',
                    ram: '16 GB RAM',
                    credit_per_min: 1,
                  },
                  'intel.medium': {
                    available_on_stacks: ['linux-ubuntu-22.04'],
                    name: 'Intel Medium',
                    chip: 'intel',
                    cpu_count: '4 vCPU',
                    cpu_description: '3.1GHz',
                    ram: '16 GB RAM',
                    credit_per_min: 1,
                  },
                  'intel.large': {
                    available_on_stacks: ['linux-ubuntu-22.04'],
                    name: 'Intel Large',
                    chip: 'intel',
                    cpu_count: '8 vCPU',
                    cpu_description: '3.1GHz',
                    ram: '32 GB RAM',
                    credit_per_min: 2,
                  },
                  'amd.medium': {
                    available_on_stacks: ['linux-ubuntu-22.04', 'mixed-stack'],
                    name: 'EPYC Zen4 Medium',
                    chip: 'amd',
                    cpu_count: '4 vCPU',
                    cpu_description: '3.7GHz',
                    ram: '16 GB RAM',
                    credit_per_min: 1,
                  },
                  'amd.large': {
                    available_on_stacks: ['linux-ubuntu-22.04', 'mixed-stack'],
                    name: 'EPYC Zen4 Large',
                    chip: 'amd',
                    cpu_count: '8 vCPU',
                    cpu_description: '3.7GHz',
                    ram: '32 GB RAM',
                    credit_per_min: 3,
                  },
                  'amd.x-large': {
                    available_on_stacks: ['linux-ubuntu-22.04', 'mixed-stack'],
                    name: 'EPYC Zen4 X Large',
                    chip: 'amd',
                    cpu_count: '16 vCPU',
                    cpu_description: '3.7GHz',
                    ram: '64 GB RAM',
                    credit_per_min: 5,
                  },
                  'machine-x': {
                    available_on_stacks: ['linux-ubuntu-22.04'],
                    name: 'Non Credit Machine',
                    chip: 'apple',
                    cpu_count: '8 vCPU',
                    cpu_description: '3.7GHz',
                    ram: '32 GB RAM',
                  },
                },
              },
            },
      machine_type_promotion: options?.privateCloud
        ? undefined
        : {
            mode: 'trial',
            promoted_machine_types: [
              {
                id: 'machine-y1',
                name: 'Machine Y1',
                chip: 'apple',
                cpu_count: '8 vCPU',
                cpu_description: '3.7GHz',
                ram: '32 GB RAM',
                os_id: 'osx',
                available_on_stacks: ['osx-xcode-16'],
              },
              {
                id: 'machine-y2',
                name: 'Machine Y2',
                chip: 'apple',
                cpu_count: '8 vCPU',
                cpu_description: '3.7GHz',
                ram: '32 GB RAM',
                os_id: 'osx',
                available_on_stacks: ['osx-xcode-16'],
              },
              {
                id: 'machine-z1',
                name: 'Machine Z1',
                chip: 'apple',
                cpu_count: '8 vCPU',
                cpu_description: '3.7GHz',
                ram: '32 GB RAM',
                os_id: 'linux',
                available_on_stacks: ['linux-ubuntu-22.04'],
              },
              {
                id: 'machine-z2',
                name: 'Machine Z2',
                chip: 'apple',
                cpu_count: '8 vCPU',
                cpu_description: '3.7GHz',
                ram: '32 GB RAM',
                os_id: 'linux',
                available_on_stacks: [],
              },
            ],
          },
    } satisfies StacksAndMachinesResponse);
  });
};
