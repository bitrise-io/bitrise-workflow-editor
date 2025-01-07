import { useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import useSearch from '../../../hooks/useSearch';

const useDebouncedFilter = () => {
  const search = useSearch((s) => s.stepQuery);
  const categories = useSearch((s) => s.stepCategoryFilter);
  const [debouncedSearch] = useDebounceValue(search, 300);

  return useMemo(() => ({ search: debouncedSearch, categories }), [debouncedSearch, categories]);
};

export default useDebouncedFilter;
