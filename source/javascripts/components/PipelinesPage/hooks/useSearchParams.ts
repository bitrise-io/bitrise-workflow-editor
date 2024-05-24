import { useHistory } from '@bitrise/bitkit';

const useSearchParams = () => {
  const history = useHistory();
  const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');

  const setSearchParams = (setter: (prevSearchParams: URLSearchParams) => URLSearchParams) => {
    const prevSearchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const nextSearchParams = setter(prevSearchParams);
    const basePath = `${window.location.href.replace(window.location.origin, '').replace(`?${prevSearchParams}`, '')}`;

    if (nextSearchParams.size === 0) {
      history.replace(basePath);
    } else {
      history.replace(`${basePath}?${nextSearchParams}`);
    }
  };

  return [searchParams, setSearchParams] as const;
};

export default useSearchParams;
