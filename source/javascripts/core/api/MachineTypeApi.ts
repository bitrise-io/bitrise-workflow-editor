import { MachineType } from '@/core/models/MachineType';
import { WithId } from '@/core/models/WithId';
import Client from './client';

// DTOs
type MachineTypeConfigsResponse = {
  available_machine_type_configs: {
    [key: string]: {
      default_machine_type: string;
      machine_types: {
        [key: string]: {
          ram: string;
          name: string;
          chip: string;
          cpu_count: string;
          cpu_description: string;
          credit_per_min: number;
        };
      };
    };
  };
};

type MachineTypeConfig = MachineTypeConfigsResponse['available_machine_type_configs'][string]['machine_types'][string];

// TRANSFORMATIONS
function toMachineType({
  id,
  os,
  isDefaultForOs,
  ...dto
}: WithId<MachineTypeConfig> & {
  os: string;
  isDefaultForOs: boolean;
}): MachineType {
  const { name, cpu_count: cpuCount, cpu_description: cpuDesc, ram, credit_per_min: cost } = dto;
  const label = `${name} ${cpuCount} @ ${cpuDesc} ${ram} (${cost} credits/min)`;

  return {
    id,
    name: dto.name || id,
    label,
    os,
    spec: {
      cpu: {
        chip: dto.chip,
        count: dto.cpu_count,
        description: dto.cpu_description,
      },
      ram: dto.ram,
    },
    creditCost: cost,
    isDefaultForOs,
  };
}

function toMachineTypeArray(response: MachineTypeConfigsResponse): MachineType[] {
  return Object.entries(response)
    .flatMap(([os, osConfig]) => {
      return Object.entries(osConfig[os].machine_types).map(([machineId, machineConfig]) =>
        toMachineType({
          id: machineId,
          ...machineConfig,
          os,
          isDefaultForOs: Boolean(osConfig[os].default_machine_type === machineId),
        }),
      );
    })
    .filter((machineType) => !!machineType);
}

// API CALLS
const GET_MACHINE_TYPES_PATH = `/app/:appSlug/machine_type_configs`;

function getMachineTypesPath(appSlug: string): string {
  return GET_MACHINE_TYPES_PATH.replace(':appSlug', appSlug);
}

async function getMachineTypes({ appSlug, signal }: { appSlug: string; signal?: AbortSignal }): Promise<MachineType[]> {
  const response = await Client.get<MachineTypeConfigsResponse>(getMachineTypesPath(appSlug), { signal });
  return toMachineTypeArray(response);
}

export default {
  getMachineTypesPath,
  getMachineTypes,
};
