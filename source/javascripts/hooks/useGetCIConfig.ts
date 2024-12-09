import { useMutation, useQuery } from '@tanstack/react-query';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { ClientError } from '@/core/api/client';
import { BitriseYml } from '@/core/models/BitriseYml';

type QueryProps = { enabled?: boolean; projectSlug: string; readFromRepo?: boolean };

const useCiConfigQuery = (props: QueryProps) => {
  const { enabled, projectSlug, readFromRepo } = props;

  return useQuery<BitriseYml, ClientError>({
    enabled,
    retry: false,
    queryKey: [BitriseYmlApi.getBitriseYmlPath({ projectSlug }), readFromRepo],
    queryFn: ({ signal }) => BitriseYmlApi.getBitriseYml({ projectSlug, readFromRepo, signal }),
    staleTime: Infinity,
  });
};

type MutationProps = Omit<QueryProps, 'enabled'>;

const useCiConfigMutation = () => {
  return useMutation<BitriseYml, ClientError, MutationProps>({
    mutationFn: ({ projectSlug, readFromRepo }) => BitriseYmlApi.getBitriseYml({ projectSlug, readFromRepo }),
  });
};

export { useCiConfigQuery, useCiConfigMutation };
