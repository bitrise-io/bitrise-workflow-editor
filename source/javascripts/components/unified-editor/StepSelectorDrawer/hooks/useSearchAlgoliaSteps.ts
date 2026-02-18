import { useQuery } from '@tanstack/react-query';

import AlgoliaApi from '@/core/api/AlgoliaApi';

import useDebouncedFilter from './useDebouncedFilter';

const useSearchAlgoliaSteps = (maintainersOverride?: string[]) => {
  const { search, categories, maintainers } = useDebouncedFilter();

  const effectiveMaintainers = maintainersOverride ?? maintainers;

  return useQuery({
    queryKey: ['search-algolia-steps', { search, categories, maintainers: effectiveMaintainers }] as const,
    queryFn: () => AlgoliaApi.searchSteps(search, categories, effectiveMaintainers),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hour
    placeholderData: (prev) => prev,
  });
};

export default useSearchAlgoliaSteps;
