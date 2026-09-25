import { useEffect, useMemo, useState } from 'react';
import { BaseLocationHook, Path } from 'wouter';

type Options = {
  state?: Record<string, unknown>;
};

export const navigate = (to: Path, { state }: Options = {}): void => {
  const hash = to.replace(/^\/?#?!?\/?/, '');
  const targetUrl = new URL(window.parent.location.href);

  targetUrl.hash = hash ? `#!/${hash}` : '';

  window.parent.location.hash = targetUrl.hash;
  window.parent.history.replaceState(state, '', targetUrl);
  window.DD_RUM?.startView(`/app/?/workflow_editor${targetUrl.hash?.split('?')?.[0] || '#!/workflows'}`);
};

const useHashLocation: BaseLocationHook = () => {
  const [path, setPath] = useState(`/${window.parent.location.hash.replace(/^#?!?\/?/, '')}`);

  useEffect(() => {
    const listener = () => {
      setPath(`/${window.parent.location.hash.replace(/^#?!?\/?/, '')}`);
    };

    window.parent.addEventListener('hashchange', listener);
    // A navigation between render and subscribing (e.g. the layout-effect `<Redirect>` in
    // MainLayout) fires its `hashchange` before this listener exists, so re-read once now.
    listener();

    return () => {
      window.parent.removeEventListener('hashchange', listener);
    };
  }, []);

  return useMemo(() => [path, navigate], [path]);
};

export default useHashLocation;
