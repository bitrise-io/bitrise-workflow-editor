import { useQuery, UseQueryResult } from '@tanstack/react-query';
import uniqBy from 'lodash/uniqBy';
import useAlgolia from '@/hooks/useAlgolia';
import { AlgoliaStepResponse } from '@/models/Algolia';

type Props = {
  attributesToRetrieve: Array<string>;
};

const useAlgoliaSteps = ({ attributesToRetrieve = ['*'] }: Props): UseQueryResult<AlgoliaStepResponse[]> => {
  const { algoliaStepsClient } = useAlgolia();

  return useQuery<AlgoliaStepResponse[]>({
    queryKey: ['algolia', 'steps', attributesToRetrieve],
    queryFn: async (): Promise<AlgoliaStepResponse[]> => {
      const results: Array<AlgoliaStepResponse> = [];
      const attrs = attributesToRetrieve.includes('*') ? ['*'] : ['id', ...attributesToRetrieve];
      await algoliaStepsClient.browseObjects<AlgoliaStepResponse>({
        batch: (objects) => results.push(...objects),
        attributesToRetrieve: attrs,
        filters: 'is_latest:true AND is_deprecated:false',
      });
      return uniqBy(results, 'id');
    },
    enabled: !!algoliaStepsClient,
    staleTime: Infinity,
  });
};

export default useAlgoliaSteps;
