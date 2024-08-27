import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useQuery } from '@tanstack/react-query';

import { useAlgoliaSteps } from '@/hooks/useAlgolia';
import { Step } from '@/core/models/Step';
import { SearchFormValues } from '../StepSelectorDrawer.types';

const useSearchSteps = ({ search, categories }: SearchFormValues) => {
  const { data: steps = [], isLoading, isError, refetch } = useAlgoliaSteps();
  const index = useMemo(() => {
    const options = {
      keys: [
        { name: 'resolvedInfo.id', weight: 2 },
        { name: 'resolvedInfo.title', weight: 3 },
        { name: 'defaultValues.summary', weight: 0.5 },
        { name: 'defaultValues.type_tags' },
      ],
      threshold: 0.25,
      ignoreLocation: true,
      useExtendedSearch: true,
    };
    const idx = Fuse.createIndex(options.keys, steps);
    return new Fuse(steps, options, idx);
  }, [steps]);

  const query = useQuery({
    enabled: !isLoading,
    staleTime: Infinity,
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['drawer', 'steps', search, categories],
    queryFn: async () => {
      let items = steps || ([] as Step[]);
      const expressions = [];

      if (search) {
        const term = search.trim().toLowerCase();
        const exp = {
          $or: [
            { $path: 'resolvedInfo.id', $val: term },
            { $path: 'resolvedInfo.title', $val: term },
            { $path: 'defaultValues.summary', $val: term },
          ],
        };
        expressions.push(exp);
      }

      if (categories.length > 0) {
        const exp = {
          $or: categories.map((category) => ({
            $path: 'defaultValues.type_tags',
            // "'term" means to include the term in the value
            $val: `'${category}`,
          })),
        };
        expressions.push(exp);
      }

      if (expressions.length > 0) {
        const results = index.search<Step>({
          $and: expressions,
        });
        items = results.map((result) => result.item);
      }

      return items;
    },
  });

  return {
    ...query,
    data: query.data as Step[],
    isLoading: isLoading || query.isFetching,
    isError: isError || query.isError,
    refetch,
  };
};

export default useSearchSteps;
