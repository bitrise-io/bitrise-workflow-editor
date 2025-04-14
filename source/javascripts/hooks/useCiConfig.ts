import { UndefinedInitialDataOptions, useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';
import { stringify } from 'yaml';
import BitriseYmlApi, { GetCiConfigResultYml } from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { BitriseYml } from '@/core/models/BitriseYml';
import PageProps from '@/core/utils/PageProps';

type UseGetCiConfigProps = {
  projectSlug: string;
  forceToReadFromRepo?: boolean;
};

type UseSaveCiConfigProps = {
  yml: BitriseYml;
  version?: string;
  projectSlug: string;
  tabOpenDuringSave?: string;
};

type UseGetCiConfigOptions<T> = Omit<UndefinedInitialDataOptions<T, ClientError>, 'queryKey' | 'queryFn'>;
type UseSaveCiConfigOptions = UseMutationOptions<GetCiConfigResultYml, ClientError, UseSaveCiConfigProps>;

export function useGetCiConfig(props: UseGetCiConfigProps, options?: UseGetCiConfigOptions<GetCiConfigResultYml>) {
  return useQuery({
    queryKey: [BitriseYmlApi.ciConfigPath({ format: 'yml', ...props })],
    queryFn: ({ signal }) => BitriseYmlApi.getCiConfig({ ...props, format: 'yml', signal }),
    staleTime: Infinity,
    ...options,
  });
}

export function useSaveCiConfig(options?: UseSaveCiConfigOptions) {
  return useMutation({
    mutationFn: async ({ projectSlug, yml, version, tabOpenDuringSave }) => {
      // Format the YML before saving
      const formattedYml = await BitriseYmlApi.formatCiConfig(stringify(yml));

      // Send the formatted YML to the server
      await BitriseYmlApi.saveCiConfig({
        projectSlug,
        data: formattedYml,
        version,
        tabOpenDuringSave,
      });

      // Re-fetch YML to get the latest version
      return BitriseYmlApi.getCiConfig({
        projectSlug: PageProps.appSlug(),
        format: 'yml',
      });
    },
    ...options,
  });
}
