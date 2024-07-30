import { useQuery, UseQueryResult } from '@tanstack/react-query';
import useAlgolia from './useAlgolia';
import { AlgoliaStepResponse } from '@/models/Algolia';

type Props = {
  id: string;
  enabled?: boolean;
  latestOnly?: boolean;
};

const useAlgoliaStep = ({ id, enabled, latestOnly }: Props): UseQueryResult<Array<AlgoliaStepResponse>> => {
  const { algoliaStepsClient } = useAlgolia();

  return useQuery<AlgoliaStepResponse[]>({
    queryKey: ['algolia-step', id, latestOnly] as const,
    queryFn: async () => {
      const results: Array<AlgoliaStepResponse> = [];

      await algoliaStepsClient.browseObjects<AlgoliaStepResponse>({
        batch: (batch) => results.push(...batch),
        filters: latestOnly ? `id:${id} AND is_latest:true` : `id:${id}`,
      });

      return results;
    },
    enabled: Boolean(algoliaStepsClient && enabled && id),
    staleTime: Infinity,
  });
};

export default useAlgoliaStep;
