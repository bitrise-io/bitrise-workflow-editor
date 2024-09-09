import mapValues from 'lodash/mapValues';
import { Stack } from '../models/Stack';
import { MachineType } from '../models/MachineType';
import Client from './client';

type StacksAndMachinesResponse = {
  has_self_hosted_runner: boolean;
  has_dedicated_machine: boolean;
  default_stack_id: string;
  default_machine_id: string;
  available_stacks: {
    [stackId: string]: {
      title: string;
    };
  };
  available_machines: {
    [osId: string]: {
      machine_types: {
        [machineTypeId: string]: {
          ram: string;
          name: string;
          chip: string;
          cpu_count: string;
          credit_per_min: number;
          cpu_description: string;
          available_on_stacks: string[];
        };
      };
    };
  };
};

const GET_STACKS_AND_MACHINES_PATH = `/app/:appSlug/stacks_and_machines`;

function getStacksAndMachinesPath(appSlug: string): string {
  return GET_STACKS_AND_MACHINES_PATH.replace(':appSlug', appSlug);
}

async function getStacksAndMachines({ appSlug, signal }: { appSlug: string; signal?: AbortSignal }) {
  const response = await Client.get<StacksAndMachinesResponse>(getStacksAndMachinesPath(appSlug), {
    signal,
  });

  const availableStacks: Stack[] = [];
  const availableMachineTypes: MachineType[] = [];
  const availableMachineTypesForStacks = new Map<string, Set<string>>();

  mapValues(response.available_machines, (os) => {
    mapValues(os.machine_types, (machine, id) => {
      availableMachineTypes.push({
        id,
        name: machine.name,
        creditCost: machine.credit_per_min,
        specs: {
          ram: machine.ram,
          cpu: {
            chip: machine.chip,
            cpuCount: machine.cpu_count,
            cpuDescription: machine.cpu_description,
          },
        },
      });

      machine.available_on_stacks.forEach((stackId) => {
        if (!availableMachineTypesForStacks.has(stackId)) {
          availableMachineTypesForStacks.set(stackId, new Set());
        }

        availableMachineTypesForStacks.get(stackId)?.add(id);
      });
    });
  });

  mapValues(response.available_stacks, ({ title }, id) => {
    availableStacks.push({
      id,
      name: title,
      machineTypes: Array.from(availableMachineTypesForStacks.get(id) ?? []),
    });
  });

  return {
    hasSelfHostedRunner: response.has_self_hosted_runner,
    hasDedicatedMachine: response.has_dedicated_machine,
    defaultStackId: response.default_stack_id,
    defaultMachineId: response.default_machine_id,
    availableStacks,
    availableMachineTypes,
  };
}

export { StacksAndMachinesResponse };
export default { getStacksAndMachinesPath, getStacksAndMachines };
