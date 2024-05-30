import { useCallback, useEffect, useState } from 'react';

const getSearchParamsFromLocationHash = (): Record<string, string> => {
  return Object.fromEntries(new URLSearchParams(window.location.hash.split('?')[1] || ''));
};

const setSearchParamsInLocationHash = (newSearchParams: Record<string, string>) => {
  const hashBase = window.location.hash.split('?')[0];
  const searchParams = new URLSearchParams(newSearchParams);
  window.location.hash = searchParams.size > 0 ? `${hashBase}?${searchParams}` : hashBase;
};

const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(getSearchParamsFromLocationHash());

  useEffect(() => {
    const listener = () => setSearchParams(getSearchParamsFromLocationHash());
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, []);

  const exposedSetSearchParams: typeof setSearchParams = useCallback((actionOrValue) => {
    setSearchParams((prevSearchParams) => {
      const newSearchParams = typeof actionOrValue === 'function' ? actionOrValue(prevSearchParams) : actionOrValue;
      setSearchParamsInLocationHash(newSearchParams);
      return newSearchParams;
    });
  }, []);

  return [searchParams, exposedSetSearchParams] as const;
};

export default useSearchParams;
