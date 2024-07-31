import { UseQueryOptions } from '@tanstack/react-query';
import getCookie from '@/utils/cookies';

export type MachineTypeConfigs = {
  available_machine_type_configs: {
    [key: string]: {
      default_machine_type: string;
      machine_types: {
        [key: string]: {
          ram: string;
          name: string;
          cpu_count: string;
          cpu_description: string;
          credit_per_min: number;
        };
      };
    };
  };
};

export const GET_MACHINE_TYPE_CONFIGS_PATH = `/app/:appSlug/machine_type_configs`;

export const getMachineTypeConfigsPath = (appSlug: string) =>
  GET_MACHINE_TYPE_CONFIGS_PATH.replace(':appSlug', appSlug);

export const getMachineTypeConfigsQueryOptions = (
  appSlug: string,
): UseQueryOptions<MachineTypeConfigs, Error, MachineTypeConfigs> => ({
  staleTime: Infinity,
  queryKey: [getMachineTypeConfigsPath(appSlug)],
  queryFn: ({ signal }) => getMachineTypeConfigs(appSlug, signal),
});

// TODO: Create a general fetch service
const getMachineTypeConfigs = async (appSlug: string, signal?: AbortSignal) => {
  const response = await fetch(getMachineTypeConfigsPath(appSlug), {
    signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCookie('CSRF-TOKEN'),
    },
  });

  return (await response.json()) as MachineTypeConfigs;
};

export default getMachineTypeConfigs;
