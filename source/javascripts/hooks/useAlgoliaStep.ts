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
  attributesToRetrieve,
}: Props): UseQueryResult<Array<AlgoliaStepResponse>> => {
  const { algoliaStepsClient } = useAlgolia();

  return useQuery<AlgoliaStepResponse[]>({
    queryKey: [id, latestOnly, attributesToRetrieve] as const,
    queryFn: async ({ queryKey: [_id, _latestOnly, _attributesToRetrieve = ['*']] }) => {
      const results: Array<AlgoliaStepResponse> = [];
      await algoliaStepsClient.browseObjects<AlgoliaStepResponse>({
        batch: (batch) => results.push(...batch),
        attributesToRetrieve: _attributesToRetrieve as string[],
        filters: _latestOnly ? `id:${_id} AND is_latest:true` : `id:${_id}`,
      });
      return results;
    },
    enabled: Boolean(algoliaStepsClient && enabled),
    staleTime: Infinity,
  });
};

export default useAlgoliaStep;
