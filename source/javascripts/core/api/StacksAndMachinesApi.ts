import { mapValues } from 'es-toolkit';

import {
  MachineRegionName,
  MachineType,
  Stack,
  StackOS,
  StackStatus,
  StackVersions,
  StackVersionTier,
} from '../models/StackAndMachine';
import Client from './client';

enum RegionID {
  US = 'region-us',
  EU = 'region-eu',
}

const regionNames: Record<string, MachineRegionName> = {
  [RegionID.US]: MachineRegionName.US,
  [RegionID.EU]: MachineRegionName.EU,
};

type StackVersionsApiItem = {
  latest_version?: string;
  rollback_version?: string;
};

type StackApiItem = {
  id: string;
  os?: string;
  title: string;
  status: string;
  description?: string;
  'description-link'?: string;
  'description-link-gen2'?: string;
  'description-link-gen2-applesilicon'?: string;
  machines?: string[];
  rollback_version?: {
    [machineTypeId: string]: { free?: string; paying?: string };
  };
  available_on_machines?: Partial<Record<StackVersionTier, { [machineTypeId: string]: StackVersionsApiItem }>>;
};

type StackGroupApiItem = {
  label: string;
  status: StackStatus;
  stacks: StackApiItem[];
};

type MachineApiItem = {
  available_in_regions: Partial<Record<string, MachineTypeInfoApi | MachineTypeInfoApi[]>>;
  available_on_stacks?: string[];
  credit_per_min?: number;
  exact_machine_type_ids?: string[];
  id: string;
  is_disabled: boolean;
  name: string;
  os_id?: string;
};

type MachineTypeInfoApi = {
  cpu_count: string;
  name: string;
  ram: string;
};

type MachineGroupApiItem = {
  label: string;
  machines: MachineApiItem[];
};

type StacksAndMachinesResponse = {
  has_self_hosted_runner: boolean;
  running_builds_on_private_cloud: boolean;
  default_stack_id: string;
  default_machine_id: string;
  default_machines: MachineApiItem[];
  grouped_stacks?: StackGroupApiItem[];
  grouped_machines?: MachineGroupApiItem[];
  region?: RegionID;
};

function mapOSValues(os: string): StackOS {
  if (['macos', 'linux'].includes(os)) {
    return os as StackOS;
  }

  if (os === 'osx') {
    return 'macos';
  }

  return 'unknown';
}

function mapStackStatus(status: string): StackStatus {
  if (['edge', 'stable', 'frozen'].includes(status)) {
    return status as StackStatus;
  }

  return 'unknown';
}

function toStackVersions(item: StackVersionsApiItem): StackVersions {
  return {
    latestVersion: item.latest_version,
    rollbackVersion: item.rollback_version,
  };
}

function toAvailableOnMachines(item: StackApiItem): Stack['availableOnMachines'] {
  if (!item.available_on_machines) {
    return undefined;
  }

  return mapValues(item.available_on_machines, (machines) => mapValues(machines ?? {}, toStackVersions));
}

function toStack(item: StackApiItem): Stack {
  return {
    id: item.id,
    name: item.title,
    description: item.description ?? '',
    descriptionUrl:
      item['description-link-gen2-applesilicon'] || item['description-link-gen2'] || item['description-link'],
    machineTypes: item.machines ?? [],
    rollbackVersion: item.rollback_version,
    availableOnMachines: toAvailableOnMachines(item),
    os: mapOSValues(item.os ?? ''),
    status: mapStackStatus(item.status),
  };
}

const toMachineTypeInfoText = (name: string, cpuCount: string, ram: string) => {
  return `${name} ${cpuCount} ${ram}`;
};

function toMachineType(item: MachineApiItem): MachineType {
  let availableInRegions: Partial<Record<MachineRegionName, string[]>> = {};

  (Object.entries(item.available_in_regions) as [RegionID, MachineTypeInfoApi | MachineTypeInfoApi[]][]).forEach(
    ([regionId, regionInfo]) => {
      const infoItems = Array.isArray(regionInfo) ? regionInfo : [regionInfo];
      availableInRegions[regionNames[regionId]] = infoItems.map((info) =>
        toMachineTypeInfoText(info.name, info.cpu_count, info.ram),
      );
    },
  );

  return {
    creditPerMinute: item.credit_per_min,
    id: item.id,
    name: item.name,
    os: mapOSValues(item.os_id ?? ''),
    isDisabled: item.is_disabled,
    availableInRegions,
    availableOnStacks: item.available_on_stacks ?? [],
    exactMachineTypeIds: item.exact_machine_type_ids ?? [],
  };
}

const GET_STACKS_AND_MACHINES_PATH = `/app/:appSlug/stacks_and_machines`;

function getStacksAndMachinesPath(appSlug: string): string {
  return GET_STACKS_AND_MACHINES_PATH.replace(':appSlug', appSlug);
}

async function getStacksAndMachines({ appSlug, signal }: { appSlug: string; signal?: AbortSignal }) {
  const response = await Client.get<StacksAndMachinesResponse>(getStacksAndMachinesPath(appSlug), {
    signal,
  });

  const defaultMachines = response.default_machines.map(toMachineType);
  const groupedStacks =
    response.grouped_stacks?.map((group) => ({
      label: group.label,
      status: group.status,
      stacks: group.stacks.map(toStack),
    })) ?? [];
  const availableStacks = groupedStacks.flatMap((group) => group.stacks);

  const groupedMachines =
    response.grouped_machines?.map((group) => ({
      label: group.label,
      machines: group.machines.map(toMachineType),
    })) ?? [];
  const availableMachines: MachineType[] = [];
  groupedMachines.forEach((group) => {
    group.machines.forEach((machine) => {
      if (machine.isDisabled) {
        return;
      }
      availableMachines.push(machine);
    });
  });

  return {
    availableStacks,
    groupedStacks,
    defaultMachines,
    availableMachines,
    groupedMachines,
    defaultStackId: response.default_stack_id,
    defaultMachineTypeId: response.default_machine_id,
    hasSelfHostedRunner: response.has_self_hosted_runner,
    region: response.region ? regionNames[response.region] : undefined,
    runningBuildsOnPrivateCloud: response.running_builds_on_private_cloud,
  };
}

export type { MachineApiItem, MachineGroupApiItem, StackApiItem, StackGroupApiItem, StacksAndMachinesResponse };
export default { getStacksAndMachinesPath, getStacksAndMachines };
