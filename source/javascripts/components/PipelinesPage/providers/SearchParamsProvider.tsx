import { Dispatch, PropsWithChildren, SetStateAction, createContext, useEffect, useMemo, useState } from 'react';

type Props = PropsWithChildren;

type Context = readonly [URLSearchParams, Dispatch<SetStateAction<URLSearchParams>>];

export const SearchParamsContext = createContext<Context>([new URLSearchParams(), () => undefined]);

const getCurrentSearchParams = () => new URLSearchParams(window.location.hash.split('?')[1] || '');

const SearchParamsProvider = ({ children }: Props) => {
  const [searchParams, setSearchParams] = useState(getCurrentSearchParams());
  const value = useMemo(() => [searchParams, setSearchParams] as const, [searchParams]);

  useEffect(() => {
    const prevSearchParams = getCurrentSearchParams();

    searchParams.sort();
    prevSearchParams.sort();

    if (prevSearchParams.toString() !== searchParams.toString()) {
      const url = new URL(window.location.href);
      const hashBase = url.hash.split('?')[0];

      url.hash = searchParams.size > 0 ? `${hashBase}?${searchParams}` : hashBase;

      window.location.assign(url);
    }
  }, [searchParams]);

  return <SearchParamsContext.Provider value={value}>{children}</SearchParamsContext.Provider>;
};

export default SearchParamsProvider;
