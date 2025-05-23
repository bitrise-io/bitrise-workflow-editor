import { UndefinedInitialDataOptions, useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';

import BitriseYmlApi, { GetCiConfigResult } from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import PageProps from '@/core/utils/PageProps';

type UseGetCiConfigProps = {
  projectSlug: string;
  forceToReadFromRepo?: boolean;
};

type UseSaveCiConfigProps = {
  version?: string;
  ymlString: string;
  projectSlug: string;
  tabOpenDuringSave?: string;
};

type UseGetCiConfigOptions<T> = Omit<UndefinedInitialDataOptions<T, ClientError>, 'queryKey' | 'queryFn'>;
type UseSaveCiConfigOptions = UseMutationOptions<GetCiConfigResult, ClientError, UseSaveCiConfigProps>;

export function useGetCiConfig(props: UseGetCiConfigProps, options?: UseGetCiConfigOptions<GetCiConfigResult>) {
  return useQuery({
    queryKey: [BitriseYmlApi.ciConfigPath({ ...props })],
    queryFn: ({ signal }) => BitriseYmlApi.getCiConfig({ ...props, signal }),
    staleTime: Infinity,
    ...options,
  });
}

export function useSaveCiConfig(options?: UseSaveCiConfigOptions) {
  return useMutation({
    mutationFn: async ({ projectSlug, ymlString, version, tabOpenDuringSave }) => {
      await BitriseYmlApi.saveCiConfig({
        version,
        projectSlug,
        data: ymlString,
        tabOpenDuringSave,
      });

      // Re-fetch YML to get the latest version
      return BitriseYmlApi.getCiConfig({
        projectSlug: PageProps.appSlug(),
      });
    },
    ...options,
  });
}
