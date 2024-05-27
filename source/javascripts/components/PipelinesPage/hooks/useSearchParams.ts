import { useHistory } from '@bitrise/bitkit';

const useSearchParams = () => {
  const history = useHistory();
  const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');

  const setSearchParams = (setter: (prevSearchParams: URLSearchParams) => URLSearchParams) => {
    const nextSearchParams = setter(searchParams);
    const hasNextSearchParams = nextSearchParams.size > 0;

    const url = new URL(window.location.href);
    url.hash = `#!/${url.hash.replace('#!/', '').split('?')[0]}${hasNextSearchParams ? `?${nextSearchParams}` : ''}`;

    history.replace(url.href.replace(url.origin, ''));
  };

  return [searchParams, setSearchParams] as const;
};

export default useSearchParams;
