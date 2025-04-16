import { useEffect, useMemo, useState } from 'react';
import { BaseLocationHook, Path } from 'wouter';

type Options = {
  state?: Record<string, unknown>;
};

const navigate = (to: Path, { state }: Options = {}): void => {
  const hash = to.replace(/^\/?#?!?\/?/, '');
  const targetUrl = new URL(window.parent.location.href);

  targetUrl.hash = hash ? `#!/${hash}` : '';

  window.parent.location.hash = targetUrl.hash;
  window.parent.history.replaceState(state, '', targetUrl);
};

const useHashLocation: BaseLocationHook = () => {
  const [path, setPath] = useState(`/${window.parent.location.hash.replace(/^#?!?\/?/, '')}`);

  useEffect(() => {
    const listener = () => {
      setPath(`/${window.parent.location.hash.replace(/^#?!?\/?/, '')}`);
    };

    window.parent.addEventListener('hashchange', listener);

    return () => {
      window.parent.removeEventListener('hashchange', listener);
    };
  }, []);

  return useMemo(() => [path, navigate], [path]);
};

export default useHashLocation;
