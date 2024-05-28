import { useContext } from 'react';
import { SearchParamsContext } from '../providers/SearchParamsProvider';

const useSearchParams = () => {
  const { searchParams, setSearchParams } = useContext(SearchParamsContext);
  return [searchParams, setSearchParams] as const;
};

export default useSearchParams;
