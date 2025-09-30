import { useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import useSearch from './useSearch';

const useDebouncedFilter = () => {
  const search = useSearch((s) => s.stepQuery);
  const categories = useSearch((s) => s.stepCategoryFilter);
  const maintainers = useSearch((s) => s.stepMaintainerFilter);
  const [debouncedSearch] = useDebounceValue(search, 300);

  return useMemo(
    () => ({
      search: debouncedSearch,
      categories,
      maintainers,
    }),
    [debouncedSearch, categories, maintainers],
  );
};

export default useDebouncedFilter;
