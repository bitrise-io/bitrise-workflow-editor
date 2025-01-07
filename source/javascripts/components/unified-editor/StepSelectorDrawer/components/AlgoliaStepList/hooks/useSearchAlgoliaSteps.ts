import { useQuery } from '@tanstack/react-query';
import StepApi, { AlgoliaStepResponse } from '@/core/api/StepApi';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useDebouncedFilter from './useDebouncedFilter';

const { stepsClient } = StepApi.getAlgoliaClients();

const useSearchAlgoliaSteps = () => {
  const { search, categories } = useDebouncedFilter();

  return useQuery({
    queryKey: ['search-algolia-steps', { search, categories }] as const,
    queryFn: async () => {
      const result = await stepsClient.search<AlgoliaStepResponse>(search, {
        cacheable: true,
        hitsPerPage: 1000,
        analytics: RuntimeUtils.isProduction(),
        clickAnalytics: RuntimeUtils.isProduction(),
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
