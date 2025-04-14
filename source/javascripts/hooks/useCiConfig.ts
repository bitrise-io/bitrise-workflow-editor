import { UndefinedInitialDataOptions, useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';
import BitriseYmlApi, { GetCiConfigResultJson, GetCiConfigResultYml } from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { BitriseYml } from '@/core/models/BitriseYml';

type UseGetCiConfigProps = {
  projectSlug: string;
  forceToReadFromRepo?: boolean;
};

type UseSaveCiConfigProps<T> = {
  data: T;
  version?: string;
  projectSlug: string;
  tabOpenDuringSave?: string;
};

type UseGetCiConfigOptions<T> = Omit<UndefinedInitialDataOptions<T, ClientError>, 'queryKey' | 'queryFn'>;
type UseSaveCiConfigOptions<T> = UseMutationOptions<void, ClientError, UseSaveCiConfigProps<T>>;

export function useGetCiConfigYml(props: UseGetCiConfigProps, options?: UseGetCiConfigOptions<GetCiConfigResultYml>) {
  return useQuery({
    queryKey: [BitriseYmlApi.ciConfigPath({ format: 'yml', ...props })],
    queryFn: ({ signal }) => BitriseYmlApi.getCiConfig({ ...props, format: 'yml', signal }),
    staleTime: Infinity,
    ...options,
  });
}

export function useGetCiConfigJson(props: UseGetCiConfigProps, options?: UseGetCiConfigOptions<GetCiConfigResultJson>) {
  return useQuery({
    queryKey: [BitriseYmlApi.ciConfigPath({ format: 'json', ...props })],
    queryFn: ({ signal }) => BitriseYmlApi.getCiConfig({ ...props, format: 'json', signal }),
    staleTime: Infinity,
    ...options,
  });
}

export function useSaveCiConfigJson(options?: UseSaveCiConfigOptions<BitriseYml>) {
  return useMutation({
    mutationFn: BitriseYmlApi.saveCiConfig,
    ...options,
  });
}

export function useSaveCiConfigYml(options?: UseSaveCiConfigOptions<string>) {
  return useMutation({
    mutationFn: BitriseYmlApi.saveCiConfig,
    ...options,
  });
}
