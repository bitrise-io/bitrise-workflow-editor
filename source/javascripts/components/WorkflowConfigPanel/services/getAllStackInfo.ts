import { UseQueryOptions } from '@tanstack/react-query';
import getCookie from '../../../hooks/utils/cookies';

export type AllStackInfo = {
  available_stacks: {
    [key: string]: {
      title: string;
      project_types: string[];
      available_machines: string[];
    };
  };
  project_types_with_default_stacks: {
    [key: string]: {
      default_stack: string;
    };
  };
};

export const GET_ALL_STACK_INFO_PATH = `/app/:appSlug/all_stack_info`;

export const getAllStackInfoPath = (appSlug: string) => GET_ALL_STACK_INFO_PATH.replace(':appSlug', appSlug);

export const getAllStackInfoQueryOptions = (appSlug: string): UseQueryOptions<AllStackInfo, Error, AllStackInfo> => ({
  staleTime: Infinity,
  queryKey: [getAllStackInfoPath(appSlug)],
  queryFn: ({ signal }) => getAllStackInfo(appSlug, signal),
});

// TODO: Create a general fetch service
const getAllStackInfo = async (appSlug: string, signal?: AbortSignal) => {
  const response = await fetch(getAllStackInfoPath(appSlug), {
    signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCookie('CSRF-TOKEN'),
    },
  });

  return (await response.json()) as AllStackInfo;
};

export default getAllStackInfo;
