import { useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';

export const getSearchParamsFromLocationHash = (): Record<string, string> => {
  return Object.fromEntries(new URLSearchParams(window.location.hash.split('?')[1] || ''));
};

export const setSearchParamsInLocationHash = (newSearchParams: Record<string, string>) => {
  const hashBase = window.location.hash.split('?')[0];
  const searchParams = new URLSearchParams(newSearchParams);
  window.location.hash = searchParams.size > 0 ? `${hashBase}?${searchParams}` : hashBase;
};

const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(getSearchParamsFromLocationHash());

  useEffect(() => {
    const listener = () => {
      setSearchParams((prevSearchParams) => {
        const searchParamsFromHash = getSearchParamsFromLocationHash();

        if (!isEqual(prevSearchParams, searchParamsFromHash)) {
          return searchParamsFromHash;
        }

        return prevSearchParams;
      });
    };

    window.addEventListener('hashchange', listener);

    return () => window.removeEventListener('hashchange', listener);
  }, []);

  useEffect(() => {
    setSearchParamsInLocationHash(searchParams);
  }, [searchParams]);

  return [searchParams, setSearchParams] as const;
};

export default useSearchParams;
