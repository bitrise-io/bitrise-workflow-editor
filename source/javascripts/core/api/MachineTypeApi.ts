import { MachineType } from '@/core/models/MachineType';
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
function toMachineType({ id, ...config }: MachineTypeConfig & { id: string }): MachineType {
  const { name, cpu_count: cpuCount, cpu_description: cpuDesc, ram, credit_per_min: creditCost } = config;
  const label = `${name} ${cpuCount} @ ${cpuDesc} ${ram} (${creditCost} credits/min)`;

  return {
    id,
    name: config.name || id,
    label,
    creditCost,
  };
}

function toMachineTypeArray(response: MachineTypeConfigsResponse): MachineType[] {
  return Object.entries(response)
    .flatMap(([os, osConfig]) => {
      return Object.entries(osConfig[os].machine_types).map(([machineId, machineConfig]) =>
        toMachineType({
          id: machineId,
          ...machineConfig,
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
