import { Stack } from '@/core/models/Stack';
import Client from './client'; // DTOs

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
function toStack({ id, ...config }: StackInfo & { id: string }): Stack {
  const { title: name, available_machines: machineIds = [] } = config;

  return {
    id,
    name,
    machineTypes: machineIds,
  };
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
  return Object.entries(response.available_stacks).map<Stack>(([id, stack]) =>
    toStack({
      id,
      ...stack,
    }),
  );
}

export default {
  getStacksPath,
  getStacks,
};
