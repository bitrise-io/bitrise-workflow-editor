import { delay, http, HttpResponse } from 'msw';
import StacksAndMachinesApi, { StacksAndMachinesResponse } from './StacksAndMachinesApi';

type Options = {
  hasDedicatedMachine?: boolean;
  hasSelfHostedRunner?: boolean;
};

export const getStacksAndMachines = (options?: Options) => {
  return http.get(StacksAndMachinesApi.getStacksAndMachinesPath(':appSlug'), async () => {
    await delay();

    const availableStacks: Record<string, { title: string; available_machines?: string[] }> = {
      'osx-stack': {
        title: 'OSX Stack',
        available_machines: ['machine-0', 'machine-1'],
      },
      'linux-stack': {
        title: 'Linux Stack',
        available_machines: ['machine-2', 'machine-3'],
      },
      'mixed-stack': {
        title: 'Mixed Stack',
        available_machines: ['machine-0', 'machine-1', 'machine-2', 'machine-3'],
      },
    };

    if (options?.hasSelfHostedRunner) {
      availableStacks['agent-pool-stack'] = {
        title: 'Self-Hosted Runner: First Pool',
      };
    }

    return HttpResponse.json({
      has_dedicated_machine: Boolean(options?.hasDedicatedMachine),
      has_self_hosted_runner: Boolean(options?.hasSelfHostedRunner),
      default_stack_id: 'linux-stack',
      default_machine_id: 'machine-3',
      available_stacks: availableStacks,
      available_machines: {
        osx: {
          default_machine_type: 'machine-1',
          machine_types: {
            'machine-0': {
              chip: 'apple',
              cpu_count: '2 vCPU',
              cpu_description: '2.8GHz',
              credit_per_min: 2,
              name: 'Machine 0',
              ram: '4 GB RAM',
            },
            'machine-1': {
              chip: 'apple',
              cpu_count: '4 vCPU',
              cpu_description: '3.2GHz',
              credit_per_min: 4,
              name: 'Machine 1',
              ram: '8 GB RAM',
            },
          },
        },
        linux: {
          default_machine_type: 'machine-2',
          machine_types: {
            'machine-2': {
              chip: 'intel',
              cpu_count: '8 vCPU',
              cpu_description: '3.4GHz',
              credit_per_min: 8,
              name: 'Machine 2',
              ram: '12 GB RAM',
            },
            'machine-3': {
              chip: 'intel',
              cpu_count: '16 vCPU',
              cpu_description: '3.4GHz',
              credit_per_min: 16,
              name: 'Machine 3',
              ram: '16 GB RAM',
            },
          },
        },
      },
    } satisfies StacksAndMachinesResponse);
  });
};
