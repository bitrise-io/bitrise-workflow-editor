import { mapValues } from 'es-toolkit';
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
      description?: string;
      available_machines?: string[];
      rollback_version?: {
        [machineTypeId: string]: { free?: string; paying?: string };
      };
    };
  };
  available_machines: {
    [osId: string]: {
      default_machine_type: string;
      machine_types: {
        [machineTypeId: string]: {
          ram: string;
          name: string;
          chip: string;
          cpu_count: string;
          credit_per_min: number;
          cpu_description: string;
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
  const defaultMachineTypeIdOfOSs: { [key: string]: string } = {};

  mapValues(response.available_stacks, ({ title, description = '', available_machines = [], rollback_version }, id) => {
    availableStacks.push({
      id: String(id),
      name: title,
      description,
      machineTypes: available_machines,
      rollbackVersion: rollback_version,
    });
  });

  mapValues(response.available_machines, ({ machine_types, default_machine_type }, os) => {
    defaultMachineTypeIdOfOSs[os] = default_machine_type;

    mapValues(machine_types, (machine, id) => {
      availableMachineTypes.push({
        id: String(id),
        name: machine.name,
        ram: machine.ram,
        chip: machine.chip,
        cpuCount: machine.cpu_count,
        cpuDescription: machine.cpu_description,
        creditPerMinute: machine.credit_per_min,
      });
    });
  });

  return {
    availableStacks,
    availableMachineTypes,
    defaultMachineTypeIdOfOSs,
    defaultStackId: response.default_stack_id,
    defaultMachineTypeId: response.default_machine_id,
    hasDedicatedMachine: response.has_dedicated_machine,
    hasSelfHostedRunner: response.has_self_hosted_runner,
  };
}

export { StacksAndMachinesResponse };
export default { getStacksAndMachinesPath, getStacksAndMachines };
