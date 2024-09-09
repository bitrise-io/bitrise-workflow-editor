import { delay, http, HttpResponse } from 'msw';
import StacksAndMachinesApi, { StacksAndMachinesResponse } from './StacksAndMachinesApi';

type Options = {
  hasDedicatedMachine?: boolean;
  hasSelfHostedRunner?: boolean;
};

export const getStacksAndMachines = (options?: Options) => {
  return http.get(StacksAndMachinesApi.getStacksAndMachinesPath(':appSlug'), async () => {
    await delay();

    return HttpResponse.json({
      has_dedicated_machine: Boolean(options?.hasDedicatedMachine),
      has_self_hosted_runner: Boolean(options?.hasSelfHostedRunner),
      default_stack_id: 'stack-1',
      default_machine_id: 'machine-3',
      available_stacks: {
        'stack-0': {
          title: 'Stack 0',
        },
        'stack-1': {
          title: 'Stack 1',
        },
        'stack-2': {
          title: 'Stack 2',
        },
      },
      available_machines: {
        osx: {
          machine_types: {
            'machine-0': {
              chip: 'apple',
              cpu_count: '2 vCPU',
              cpu_description: '2.8GHz',
              credit_per_min: 2,
              name: 'Machine 0',
              ram: '4 GB RAM',
              available_on_stacks: ['stack-0', 'stack-2'],
            },
            'machine-1': {
              chip: 'apple',
              cpu_count: '4 vCPU',
              cpu_description: '3.2GHz',
              credit_per_min: 4,
              name: 'Machine 1',
              ram: '8 GB RAM',
              available_on_stacks: ['stack-0', 'stack-2'],
            },
          },
        },
        linux: {
          machine_types: {
            'machine-2': {
              chip: 'intel',
              cpu_count: '8 vCPU',
              cpu_description: '3.4GHz',
              credit_per_min: 8,
              name: 'Machine 2',
              ram: '12 GB RAM',
              available_on_stacks: ['stack-1', 'stack-2'],
            },
            'machine-3': {
              chip: 'intel',
              cpu_count: '16 vCPU',
              cpu_description: '3.4GHz',
              credit_per_min: 16,
              name: 'Machine 3',
              ram: '16 GB RAM',
              available_on_stacks: ['stack-1', 'stack-2'],
            },
          },
        },
      },
    } satisfies StacksAndMachinesResponse);
  });
};
