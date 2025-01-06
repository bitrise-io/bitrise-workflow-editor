import { useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import useSearch from '../../../hooks/useSearch';

const useDebouncedFilter = () => {
  const search = useSearch((s) => s.searchStep);
  const categories = useSearch((s) => s.searchStepCategories);
  const [debouncedSearch] = useDebounceValue(search, 300);

  return useMemo(() => ({ search: debouncedSearch, categories }), [debouncedSearch, categories]);
};

export default useDebouncedFilter;
