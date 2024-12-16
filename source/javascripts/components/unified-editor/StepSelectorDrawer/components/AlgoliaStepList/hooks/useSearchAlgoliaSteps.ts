import { useDebounceValue } from 'usehooks-ts';
import { useQuery } from '@tanstack/react-query';
import StepApi, { AlgoliaStepResponse } from '@/core/api/StepApi';
import useSearch from '../../../hooks/useSearch';

const { stepsClient } = StepApi.getAlgoliaClients();

const useSearchAlgoliaSteps = () => {
  const search = useSearch((s) => s.searchStep);
  const categories = useSearch((s) => s.searchStepCategories);
  const [debouncedSearch] = useDebounceValue(search, 300);

  return useQuery({
    queryKey: ['search-algolia-steps', { debouncedSearch, categories }] as const,
    queryFn: async () => {
      const result = await stepsClient.search<AlgoliaStepResponse>(debouncedSearch, {
        cacheable: true,
        hitsPerPage: 1000,
        facetFilters: [
          'is_latest:true',
          'is_deprecated:false',
          categories.map((category) => `step.type_tags:${category}`),
        ],
      });

      return result.hits;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hour
    placeholderData: (prev) => prev,
  });
};

export default useSearchAlgoliaSteps;
