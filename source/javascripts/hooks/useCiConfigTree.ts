import { UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { GetConfigResponse } from '@/core/models/Tree';

export const CI_CONFIG_TREE_QUERY_KEY = 'ci_config_tree';

type UseGetCiConfigTreeProps = {
  projectSlug: string;
  forceToReadFromRepo?: boolean;
  branch?: string;
};

type UseGetCiConfigTreeOptions<T> = Omit<UndefinedInitialDataOptions<T, ClientError>, 'queryKey' | 'queryFn'>;

/**
 * Tree bootstrap query (mirrors `useGetCiConfig`). The key includes branch +
 * force-from-repo so a branch switch refetches. A non-modular config is a
 * single-node tree, so the response is always tree-shaped.
 *
 * Saving goes through `usePushBranch` (`BranchesApi.pushBranch({root})`), the
 * canonical tree-save path — there is no save-in-place mutation hook yet.
 */
export function useGetCiConfigTree(
  props: UseGetCiConfigTreeProps,
  options?: UseGetCiConfigTreeOptions<GetConfigResponse>,
) {
  return useQuery({
    queryKey: [
      CI_CONFIG_TREE_QUERY_KEY,
      props.projectSlug,
      props.branch,
      { forceToReadFromRepo: props.forceToReadFromRepo },
    ],
    queryFn: ({ signal }) => BitriseYmlApi.getConfig({ ...props, signal }),
    staleTime: Infinity,
    ...options,
  });
}
