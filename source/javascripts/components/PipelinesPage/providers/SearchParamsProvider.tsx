import { Dispatch, PropsWithChildren, SetStateAction, createContext, useEffect, useMemo, useState } from 'react';

type Props = PropsWithChildren;

type Context = {
  searchParams: URLSearchParams;
  setSearchParams: Dispatch<SetStateAction<URLSearchParams>>;
};

export const SearchParamsContext = createContext<Context>({
  searchParams: new URLSearchParams(),
  setSearchParams: () => undefined,
});

const SearchParamsProvider = ({ children }: Props) => {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.hash.split('?')[1] || ''));

  const value = useMemo(() => {
    return { searchParams, setSearchParams };
  }, [searchParams]);

  useEffect(() => {
    const prevSearchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const nextSearchParams = new URLSearchParams(searchParams);

    prevSearchParams.sort();
    nextSearchParams.sort();

    if (prevSearchParams.toString() !== nextSearchParams.toString()) {
      const url = new URL(window.location.href);
      const hasNextSearchParams = nextSearchParams.size > 0;
      url.hash = `#!/${url.hash.replace('#!/', '').split('?')[0]}${hasNextSearchParams ? `?${nextSearchParams}` : ''}`;
      window.location.assign(url);
    }
  }, [searchParams]);

  return <SearchParamsContext.Provider value={value}>{children}</SearchParamsContext.Provider>;
};

export default SearchParamsProvider;
