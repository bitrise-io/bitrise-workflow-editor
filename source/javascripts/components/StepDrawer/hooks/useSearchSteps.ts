import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useQuery } from '@tanstack/react-query';

import { SearchFormValues, Step } from '../StepDrawer.types';
import useAlgoliaSteps from '../../../hooks/useAlgoliaSteps';
import { fromAlgolia, getStepsByCategories } from '../StepDrawer.utils';
import { AlgoliaStepResponse } from '../../../models/Algolia';

const ATTRIBUTES_TO_RETRIEVE = [
  'id',
  'cvs',
  'info',
  'version',
  'latest_version_number',
  'is_deprecated',
  'step.title',
  'step.summary',
  'step.description',
  'step.asset_urls',
  'step.type_tags',
];

const useSearchSteps = ({ search, categories }: SearchFormValues) => {
  const {
    data: steps = [],
    isLoading,
    isError,
  } = useAlgoliaSteps({
    attributesToRetrieve: ATTRIBUTES_TO_RETRIEVE,
  });
  const index = useMemo(() => {
    const options = {
      keys: [
        { name: 'id', weight: 1.5 },
        { name: 'step.title', weight: 2 },
        { name: 'step.summary', weight: 1 },
        { name: 'step.type_tags' },
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
            { $path: 'id', $val: term },
            { $path: 'step.title', $val: term },
            { $path: 'step.summary', $val: term },
            { $path: 'step.description', $val: term },
          ],
        };
        expressions.push(exp);
      }

      if (categories.length > 0) {
        const exp = {
          $or: categories.map((category) => ({
            $path: 'step.type_tags',
            // "'term" means to include the term in the value
            $val: `'${category}`,
          })),
        };
        expressions.push(exp);
      }

      if (expressions.length > 0) {
        const results = index.search<AlgoliaStepResponse>({
          $and: expressions,
        });
        items = results.map((result) => result.item);
        results.forEach((result) => {
          console.log(result.item.id, result.matches);
        });
      }

      const results = items.map(fromAlgolia);
      return getStepsByCategories(results);
    },
  });

  return {
    ...query,
    data: query.data as Record<string, Step[]>,
    isLoading: isLoading || query.isFetching,
    isError: isError || query.isError,
  };
};

export default useSearchSteps;
