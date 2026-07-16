import { UndefinedInitialDataOptions, useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';

import BitriseYmlApi, { GetCiConfigResult } from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { GetConfigResponse } from '@/core/models/Tree';
import { getModularConfigTree } from '@/core/stores/BitriseYmlStore';
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
type UseSaveConfigTreeOptions = UseMutationOptions<GetConfigResponse, ClientError, void>;

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
  return useMutation({
    mutationFn: async ({ projectSlug, ymlString, version, tabOpenDuringSave, conversationId }) => {
      await BitriseYmlApi.saveCiConfig({
        version,
        projectSlug,
        data: ymlString,
        tabOpenDuringSave,
        conversationId,
      });

      return BitriseYmlApi.getCiConfig({
        projectSlug: PageProps.appSlug(),
      });
    },
    ...options,
  });
}

/**
 * Local (CLI) modular save: writes every changed module file to disk via the apiserver, then
 * reloads the tree so the merged view + per-file baselines refresh. Cloud saves via push-to-branch
 * instead (`usePushBranch`). The reloaded tree is returned; the caller rebinds it via
 * `applyModularSaveResult` in `onSuccess`.
 */
export function useSaveConfigTree(options?: UseSaveConfigTreeOptions) {
  return useMutation({
    mutationFn: async () => {
      const tree = getModularConfigTree();
      if (!tree) {
        throw new Error('No modular config tree to save');
      }
      await BitriseYmlApi.saveConfigTree({ tree });
      return BitriseYmlApi.getConfig({ projectSlug: PageProps.appSlug() });
    },
    ...options,
  });
}
