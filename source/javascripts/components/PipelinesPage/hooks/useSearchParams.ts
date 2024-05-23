import { useHistory } from '@bitrise/bitkit';

const useSearchParams = () => {
  const history = useHistory();
  const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');

  const setSearchParams = (setter: (prevSearchParams: URLSearchParams) => URLSearchParams) => {
    const prevSearchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const nextSearchParams = setter(prevSearchParams);

    history.replace(
      `${window.location.href.replace(window.location.origin, '').replace(prevSearchParams.toString(), nextSearchParams.toString())}`,
    );
  };

  return [searchParams, setSearchParams] as const;
};

export default useSearchParams;
