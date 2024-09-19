import { Dispatch, SetStateAction, useCallback, useLayoutEffect, useState } from 'react';

export const getSearchParamsFromLocationHash = (): Record<string, string> => {
  return Object.fromEntries(new URLSearchParams(window.parent.location.hash.split('?')[1] || ''));
};

export const setSearchParamsInLocationHash = (newSearchParams: Record<string, string>) => {
  const hashBase = window.parent.location.hash.split('?')[0];
  const searchParams = new URLSearchParams(newSearchParams);
  window.parent.location.hash = searchParams.size > 0 ? `${hashBase}?${searchParams}` : hashBase;
};

const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(getSearchParamsFromLocationHash());

  const exposedSetSearchParams: Dispatch<SetStateAction<Record<string, string>>> = useCallback((value) => {
    setSearchParamsInLocationHash(typeof value === 'function' ? value(getSearchParamsFromLocationHash()) : value);
  }, []);

  useLayoutEffect(() => {
    const listener = () => setSearchParams(getSearchParamsFromLocationHash());
    window.parent.addEventListener('hashchange', listener);
    return () => window.parent.removeEventListener('hashchange', listener);
  }, []);

  return [searchParams, exposedSetSearchParams] as const;
};

export default useSearchParams;
