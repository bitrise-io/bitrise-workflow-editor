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
  window.DD_RUM?.startView(`/app/?/workflow_editor${targetUrl.hash?.split('?')?.[0] || '#!/workflows'}`);

  // Intercom boots inside this iframe's own document and hooks pushState/replaceState on ITS
  // window to detect SPA page views. This router only ever touches window.parent's history, so
  // Intercom never sees in-editor navigation and its "Current page URL contains…" page-targeting
  // rules are only evaluated once, at first load — later pages' tours never fire. Nudge it
  // explicitly on every route change so it re-evaluates. See:
  // https://bitrise.atlassian.net/wiki/spaces/~7120205fa5090eaf5746519410986d2d5633fd/pages/5140512927
  window.Intercom?.('update');
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
