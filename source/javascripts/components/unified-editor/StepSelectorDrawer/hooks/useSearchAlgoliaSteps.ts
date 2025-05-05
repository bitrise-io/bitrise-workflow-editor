import { useQuery } from '@tanstack/react-query';

import AlgoliaApi from '@/core/api/AlgoliaApi';

import useDebouncedFilter from './useDebouncedFilter';

const useSearchAlgoliaSteps = () => {
  const { search, categories, maintainers } = useDebouncedFilter();

  return useQuery({
    queryKey: ['search-algolia-steps', { search, categories, maintainers }] as const,
    queryFn: () => AlgoliaApi.searchSteps(search, categories, maintainers),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hour
    placeholderData: (prev) => prev,
  });
};

export default useSearchAlgoliaSteps;
