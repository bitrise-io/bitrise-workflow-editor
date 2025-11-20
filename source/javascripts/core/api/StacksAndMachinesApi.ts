import { MachineStatus, MachineType, Stack, StackOS, StackStatus } from '../models/StackAndMachine';
import Client from './client';

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
};

type StackGroupApiItem = {
  label: string;
  status: StackStatus;
  stacks: StackApiItem[];
};

type MachineApiItem = {
  id: string;
  name: string;
  os_id?: string;
  is_promoted?: boolean;
  ram: string;
  cpu_count: string;
  cpu_description: string;
  credit_per_min?: number;
  available_on_stacks?: string[];
};

type MachineGroupApiItem = {
  label: string;
  status: MachineStatus;
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

function toStack(item: StackApiItem): Stack {
  return {
    id: item.id,
    name: item.title,
    description: item.description ?? '',
    descriptionUrl:
      item['description-link-gen2-applesilicon'] || item['description-link-gen2'] || item['description-link'],
    machineTypes: item.machines ?? [],
    rollbackVersion: item.rollback_version,
    os: mapOSValues(item.os ?? ''),
    status: mapStackStatus(item.status),
  };
}

function toMachineType(item: MachineApiItem): MachineType {
  return {
    id: item.id,
    name: item.name,
    os: mapOSValues(item.os_id ?? ''),
    isPromoted: item.is_promoted ?? false,
    ram: item.ram,
    cpuCount: item.cpu_count,
    cpuDescription: item.cpu_description,
    creditPerMinute: item.credit_per_min,
    availableOnStacks: item.available_on_stacks ?? [],
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
      status: group.status,
      machines: group.machines.map(toMachineType),
    })) ?? [];
  const availableMachines = groupedMachines.filter((g) => g.status === 'available').flatMap((group) => group.machines);

  return {
    availableStacks,
    groupedStacks,
    defaultMachines,
    availableMachines,
    groupedMachines,
    defaultStackId: response.default_stack_id,
    defaultMachineTypeId: response.default_machine_id,
    hasSelfHostedRunner: response.has_self_hosted_runner,
    runningBuildsOnPrivateCloud: response.running_builds_on_private_cloud,
  };
}

export type { MachineApiItem, MachineGroupApiItem, StackApiItem, StackGroupApiItem, StacksAndMachinesResponse };
export default { getStacksAndMachinesPath, getStacksAndMachines };
