import { useEffect, useState } from 'react';
import { BaseSearchHook } from 'wouter';

const getSearchStringFromLocationHash = (): string => {
  const search = window.parent.location.hash.split('?')[1] || '';
  return search ? `?${search}` : '';
};

const useHashSearch: BaseSearchHook = () => {
  const [search, setSearch] = useState(getSearchStringFromLocationHash());

  useEffect(() => {
    const listener = () => {
      setSearch(getSearchStringFromLocationHash());
    };

    window.parent.addEventListener('hashchange', listener);

    return () => {
      window.parent.removeEventListener('hashchange', listener);
    };
  }, []);

  return search;
};

export default useHashSearch;
