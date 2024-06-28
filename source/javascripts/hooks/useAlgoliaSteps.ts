import { useQuery, UseQueryResult } from '@tanstack/react-query';
import uniqBy from 'lodash/uniqBy';
import { AlgoliaStepResponse } from '../models/Algolia';
import useAlgolia from './useAlgolia';

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
        filters: 'is_latest:true',
      });
      return uniqBy(results, 'id');
    },
    enabled: !!algoliaStepsClient,
    staleTime: Infinity,
  });
};

export default useAlgoliaSteps;
