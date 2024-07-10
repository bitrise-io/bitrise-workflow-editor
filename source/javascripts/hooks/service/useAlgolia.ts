import { useMemo } from 'react';
import algoliasearch from 'algoliasearch';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import uniqBy from 'lodash/uniqBy';
import { Paths } from 'type-fest';
import { AlgoliaStepResponse } from '@/models/service/Algolia';

export const useAlgoliaClient = () => {
  return useMemo(() => {
    const client = algoliasearch('HI1538U2K4', '708f890e859e7c44f309a1bbad3d2de8');
    const algoliaStepsClient = client.initIndex('steplib_steps');
    const algoliaInputsClient = client.initIndex('steplib_inputs');

    return {
      algoliaStepsClient,
      algoliaInputsClient,
    };
  }, []);
};

const containsWildcard = (attributes: string[]): attributes is ['*'] => {
  return attributes.length === 1 && attributes[0] === '*';
};

type UseAlgoliaStepsProps = {
  attributesToRetrieve?: string[];
};

export const useAlgoliaSteps = ({
  attributesToRetrieve = ['*'],
}: UseAlgoliaStepsProps): UseQueryResult<AlgoliaStepResponse[]> => {
  const { algoliaStepsClient } = useAlgoliaClient();

  return useQuery<AlgoliaStepResponse[]>({
    queryKey: ['algolia', 'steps', attributesToRetrieve],
    queryFn: async (): Promise<AlgoliaStepResponse[]> => {
      const results: Array<AlgoliaStepResponse> = [];
      const attrs: string[] = containsWildcard(attributesToRetrieve) ? ['*'] : ['id', ...attributesToRetrieve];
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

type UseAlgoliaStepByIdProps = {
  id: string;
  enabled?: boolean;
  latestOnly?: boolean;
  attributesToRetrieve?: Paths<AlgoliaStepResponse>[] | ['*'];
};

export const useAlgoliaStepById = ({
  id,
  enabled,
  latestOnly,
  attributesToRetrieve,
}: UseAlgoliaStepByIdProps): UseQueryResult<Array<AlgoliaStepResponse>> => {
  const { algoliaStepsClient } = useAlgoliaClient();

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
