import { useContext } from 'react';
import { SearchParamsContext } from '../providers/SearchParamsProvider';

const useSearchParams = () => useContext(SearchParamsContext);

export default useSearchParams;
