import { Stack } from '@/core/models/Stack';
import { WithId } from '@/core/models/WithId';
import Client from './client';

// DTOs
type AllStackInfoResponse = {
  available_stacks: {
    [key: string]: {
      title: string;
      project_types: string[];
      available_machines?: string[];
    };
  };
  project_types_with_default_stacks: {
    [key: string]: {
      default_stack: string;
    };
  };
};
type StackInfo = AllStackInfoResponse['available_stacks'][string];

// TRANSFORMATIONS
function toStack({ id, ...dto }: WithId<StackInfo>): Stack {
  const { title: name, available_machines: machineIds = [] } = dto;

  return {
    id,
    name,
    machineTypes: machineIds,
  };
}

function toStackArray(response: AllStackInfoResponse): Stack[] {
  return Object.entries(response.available_stacks).map<Stack>(([id, stack]) =>
    toStack({
      id,
      ...stack,
    }),
  );
}

// API CALLS
const GET_STACKS_PATH = `/app/:appSlug/all_stack_info`;

function getStacksPath(appSlug: string): string {
  return GET_STACKS_PATH.replace(':appSlug', appSlug);
}

async function getStacks({ appSlug, signal }: { appSlug: string; signal?: AbortSignal }): Promise<Stack[]> {
  const response = await Client.get<AllStackInfoResponse>(getStacksPath(appSlug), {
    signal,
  });
  return toStackArray(response);
}

export default {
  getStacksPath,
  getStacks,
};
