import { useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';

import ModularConfigApi, { ConfigFileTree } from '@/core/api/ModularConfigApi';
import { ClientError } from '@/core/api/client';
import PageProps from '@/core/utils/PageProps';

type UseGetConfigFilesProps = {
  projectSlug: string;
  enabled?: boolean;
};

export function useGetConfigFiles({ projectSlug, enabled = true }: UseGetConfigFilesProps) {
  return useQuery({
    queryKey: [ModularConfigApi.configFilesPath(projectSlug)],
    queryFn: ({ signal }) => ModularConfigApi.getConfigFiles({ projectSlug, signal }),
    staleTime: Infinity,
    enabled: enabled && !!projectSlug,
  });
}

type UseMergeConfigOptions = UseMutationOptions<string, ClientError, { tree: ConfigFileTree }>;

export function useMergeConfig(options?: UseMergeConfigOptions) {
  const projectSlug = PageProps.appSlug();

  return useMutation({
    mutationFn: ({ tree }) => ModularConfigApi.mergeConfig({ projectSlug, tree }),
    ...options,
  });
}

type UseSaveConfigFilesOptions = UseMutationOptions<
  void,
  ClientError,
  { files: Array<{ path: string; contents: string }> }
>;

export function useSaveConfigFiles(options?: UseSaveConfigFilesOptions) {
  const projectSlug = PageProps.appSlug();

  return useMutation({
    mutationFn: ({ files }) => ModularConfigApi.saveConfigFiles({ projectSlug, files }),
    ...options,
  });
}
