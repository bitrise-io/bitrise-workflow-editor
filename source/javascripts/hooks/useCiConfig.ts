import { useMutation, UseMutationOptions, useQuery } from '@tanstack/react-query';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { BitriseYml } from '@/core/models/BitriseYml';

type GetQueryProps = { enabled?: boolean; projectSlug: string; readFromRepo?: boolean };

const useGetCiConfigQuery = (props: GetQueryProps) => {
  const { enabled, projectSlug, readFromRepo } = props;

  return useQuery<BitriseYml, ClientError>({
    enabled,
    queryKey: [BitriseYmlApi.getBitriseYmlPath({ projectSlug }), readFromRepo],
    queryFn: ({ signal }) => BitriseYmlApi.getBitriseYml({ projectSlug, readFromRepo, signal }),
    staleTime: Infinity,
  });
};

type GetMutationProps = Omit<GetQueryProps, 'enabled'>;

const useGetCiConfigMutation = (options?: UseMutationOptions<BitriseYml, ClientError, GetMutationProps>) => {
  return useMutation({
    mutationFn: ({ projectSlug, readFromRepo }) => BitriseYmlApi.getBitriseYml({ projectSlug, readFromRepo }),
    ...options,
  });
};

type PostMutationProps = {
  model: BitriseYml;
  projectSlug: string;
};

const usePostCiConfigMutation = (options: UseMutationOptions<unknown, ClientError, PostMutationProps>) => {
  return useMutation({
    mutationFn: ({ projectSlug, model }) => BitriseYmlApi.updateBitriseYml({ projectSlug, model }),
    ...options,
  });
};

export { useGetCiConfigQuery, useGetCiConfigMutation, usePostCiConfigMutation };
