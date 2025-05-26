import { mapValues } from 'es-toolkit';

import { MachineType } from '../models/MachineType';
import { Stack } from '../models/Stack';
import Client from './client';

type StacksAndMachinesResponse = {
  has_self_hosted_runner: boolean;
  running_builds_on_private_cloud: boolean;
  default_stack_id: string;
  default_machine_id: string;
  available_stacks: {
    [stackId: string]: {
      title: string;
      description?: string;
      'description-link'?: string;
      'description-link-gen2'?: string;
      'description-link-gen2-applesilicon'?: string;
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
          available_on_stacks: string[];
          ram: string;
          name: string;
          chip: string;
          cpu_count: string;
          cpu_description: string;
          credit_per_min?: number;
        };
      };
    };
  };
  machine_type_promotion?: {
    mode: 'trial' | 'upsell';
    promoted_machine_types: {
      available_on_stacks: string[];
      id: string;
      ram: string;
      name: string;
      os_id: string;
      chip: string;
      cpu_count: string;
      cpu_description: string;
      credit_per_min?: number;
    }[];
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
  const promotedMachineTypes: MachineType[] = [];
  const defaultMachineTypeIdOfOSs: { [key: string]: string } = {};

  mapValues(
    response.available_stacks,
    ({ title, description = '', available_machines = [], rollback_version, ...rest }, id) => {
      availableStacks.push({
        id: String(id),
        name: title,
        description,
        descriptionUrl:
          rest['description-link-gen2-applesilicon'] || rest['description-link-gen2'] || rest['description-link'],
        machineTypes: available_machines,
        rollbackVersion: rollback_version,
      });
    },
  );

  mapValues(response.available_machines, ({ machine_types, default_machine_type }, os: string) => {
    defaultMachineTypeIdOfOSs[os] = default_machine_type;

    mapValues(machine_types, (machine, id) => {
      availableMachineTypes.push({
        availableOnStacks: machine.available_on_stacks,
        id: String(id),
        name: machine.name,
        ram: machine.ram,
        chip: machine.chip,
        cpuCount: machine.cpu_count,
        cpuDescription: machine.cpu_description,
        creditPerMinute: machine.credit_per_min,
        osId: os,
      });
    });
  });

  response.machine_type_promotion?.promoted_machine_types.forEach((machine_type) => {
    promotedMachineTypes.push({
      availableOnStacks: machine_type.available_on_stacks,
      id: machine_type.id,
      name: machine_type.name,
      ram: machine_type.ram,
      chip: machine_type.chip,
      cpuCount: machine_type.cpu_count,
      cpuDescription: machine_type.cpu_description,
      creditPerMinute: machine_type.credit_per_min,
      osId: machine_type.os_id,
    });
  });

  return {
    availableStacks,
    availableMachineTypes,
    defaultMachineTypeIdOfOSs,
    defaultStackId: response.default_stack_id,
    defaultMachineTypeId: response.default_machine_id,
    machineTypePromotion: response.machine_type_promotion && {
      mode: response.machine_type_promotion.mode,
      promotedMachineTypes,
    },
    runningBuildsOnPrivateCloud: response.running_builds_on_private_cloud,
    hasSelfHostedRunner: response.has_self_hosted_runner,
  };
}

export { StacksAndMachinesResponse };
export default { getStacksAndMachinesPath, getStacksAndMachines };
