import { UndefinedInitialDataOptions, useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';

import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { GetConfigResponse, SaveTreeResult, TreeNode } from '@/core/models/Tree';

export const CI_CONFIG_TREE_QUERY_KEY = 'ci_config_tree';

type UseGetCiConfigTreeProps = {
  projectSlug: string;
  forceToReadFromRepo?: boolean;
  branch?: string;
};

type UseSaveCiConfigTreeProps = {
  projectSlug: string;
  tree: TreeNode;
  tabOpenDuringSave?: string;
  conversationId?: string;
};

type UseGetCiConfigTreeOptions<T> = Omit<UndefinedInitialDataOptions<T, ClientError>, 'queryKey' | 'queryFn'>;
type UseSaveCiConfigTreeOptions = UseMutationOptions<SaveTreeResult, ClientError, UseSaveCiConfigTreeProps>;

/**
 * Tree bootstrap query (mirrors `useGetCiConfig`). The query key includes the
 * branch + force-from-repo so a branch switch refetches. The response is always
 * tree-shaped (a non-modular config is a single-node tree), so the caller seeds
 * the tree store unconditionally.
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

/**
 * Tree save mutation. The 200 response already carries the refreshed tree +
 * entity index, so there's no separate refetch — callers apply it to the store
 * in `onSuccess` (e.g. `applyModularSaveResult`). A 409 is thrown as a
 * `ClientError`; read `BitriseYmlApi.mapSaveConflict(error.data)` in `onError`.
 */
export function useSaveCiConfigTree(options?: UseSaveCiConfigTreeOptions) {
  return useMutation({
    mutationFn: ({ projectSlug, tree, tabOpenDuringSave, conversationId }) =>
      BitriseYmlApi.pushConfigTree({ projectSlug, tree, tabOpenDuringSave, conversationId }),
    ...options,
  });
}
