import {
  UndefinedInitialDataOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import BitriseYmlApi, { GetCiConfigResult } from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import { getSearchParamsFromLocationHash, setSearchParamsInLocationHash } from '@/hooks/useSearchParams';

const CI_CONFIG_QUERY_KEY = 'ci_config';

type UseGetCiConfigProps = {
  projectSlug: string;
  forceToReadFromRepo?: boolean;
  skipValidation?: boolean;
  branch?: string;
};

type UseSaveCiConfigProps = {
  version?: string;
  ymlString: string;
  projectSlug: string;
  tabOpenDuringSave?: string;
  conversationId?: string;
};

type UseGetCiConfigOptions<T> = Omit<UndefinedInitialDataOptions<T, ClientError>, 'queryKey' | 'queryFn'>;
type UseSaveCiConfigOptions = UseMutationOptions<GetCiConfigResult, ClientError, UseSaveCiConfigProps>;

export function useGetCiConfig(props: UseGetCiConfigProps, options?: UseGetCiConfigOptions<GetCiConfigResult>) {
  return useQuery({
    queryKey: [
      CI_CONFIG_QUERY_KEY,
      props.projectSlug,
      props.branch,
      { skipValidation: props.skipValidation, forceToReadFromRepo: props.forceToReadFromRepo },
    ],
    queryFn: ({ signal }) => BitriseYmlApi.getCiConfig({ ...props, signal }),
    staleTime: Infinity,
    ...options,
  });
}

export function loadConfigFromBranch(branch: string) {
  const current = getSearchParamsFromLocationHash();
  setSearchParamsInLocationHash({ ...current, branch });
}

export function useSwitchBranch() {
  return useMutation({
    mutationFn: ({ projectSlug, branch }: { projectSlug: string; branch: string }) =>
      BitriseYmlApi.getCiConfig({ projectSlug, branch }),
  });
}

export function useSaveCiConfig(options?: UseSaveCiConfigOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectSlug, ymlString, version, tabOpenDuringSave, conversationId }) => {
      await BitriseYmlApi.saveCiConfig({
        version,
        projectSlug,
        data: ymlString,
        tabOpenDuringSave,
        conversationId,
      });

      // Re-fetch YML to get the latest version
      const fresh = await BitriseYmlApi.getCiConfig({
        projectSlug: PageProps.appSlug(),
        branch: bitriseYmlStore.getState().configBranch,
      });

      // Invalidate cached useGetCiConfig results so a later branch-switch
      // returning to this branch refetches instead of serving stale data.
      queryClient.invalidateQueries({ queryKey: [CI_CONFIG_QUERY_KEY] });

      return fresh;
    },
    ...options,
  });
}
