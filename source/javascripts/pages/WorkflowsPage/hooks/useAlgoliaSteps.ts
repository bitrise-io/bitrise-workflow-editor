import { useQuery, UseQueryResult } from '@tanstack/react-query';
import uniqBy from 'lodash/uniqBy';
import useAlgolia from '@/hooks/useAlgolia';
import { AlgoliaStepResponse } from '@/models/Algolia';

const useAlgoliaSteps = (): UseQueryResult<AlgoliaStepResponse[]> => {
  const { algoliaStepsClient } = useAlgolia();

  return useQuery<AlgoliaStepResponse[]>({
    queryKey: ['algolia', 'steps'],
    queryFn: async (): Promise<AlgoliaStepResponse[]> => {
      const results: Array<AlgoliaStepResponse> = [];
      await algoliaStepsClient.browseObjects<AlgoliaStepResponse>({
        batch: (objects) => results.push(...objects),
        filters: 'is_latest:true AND is_deprecated:false',
      });
      return uniqBy(results, 'id');
    },
    enabled: !!algoliaStepsClient,
    staleTime: Infinity,
  });
};

export default useAlgoliaSteps;
