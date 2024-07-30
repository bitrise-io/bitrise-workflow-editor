import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Paths } from 'type-fest';
import { AlgoliaStepResponse } from '../models/Algolia';
import useAlgolia from './useAlgolia';

type Props = {
  id: string;
  enabled?: boolean;
  latestOnly?: boolean;
  attributesToRetrieve?: Paths<AlgoliaStepResponse>[] | ['*'];
};

const useAlgoliaStep = ({
  id,
  enabled,
  latestOnly,
  attributesToRetrieve = ['*'],
}: Props): UseQueryResult<Array<AlgoliaStepResponse>> => {
  const { algoliaStepsClient } = useAlgolia();

  return useQuery<AlgoliaStepResponse[]>({
    queryKey: ['algolia-step', id, latestOnly, attributesToRetrieve] as const,
    queryFn: async () => {
      const results: Array<AlgoliaStepResponse> = [];

      await algoliaStepsClient.browseObjects<AlgoliaStepResponse>({
        attributesToRetrieve,
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
