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
};

const useHashLocation: BaseLocationHook = () => {
  const [path, setPath] = useState(`/${window.parent.location.hash.replace(/^#?!?\/?/, '')}`);

  useEffect(() => {
    const listener = () => {
      setPath(`/${window.parent.location.hash.replace(/^#?!?\/?/, '')}`);

      // Intercom boots inside this iframe's own document and hooks pushState/replaceState on ITS
      // window to detect SPA page views. Hash changes on window.parent — whether from our own
      // navigate() below, an Intercom tour step's own button, or anything else touching the
      // parent's location — never call this window's History API, so Intercom can't see them and
      // its "Current page URL contains…" targeting rules are evaluated once, at first load, and
      // never again. hashchange on window.parent is the one thing every kind of navigation here
      // has in common, so nudge Intercom from there rather than from navigate() alone. See:
      // https://bitrise.atlassian.net/wiki/spaces/~7120205fa5090eaf5746519410986d2d5633fd/pages/5140512927
      window.Intercom?.('update');
    };

    window.parent.addEventListener('hashchange', listener);

    return () => {
      window.parent.removeEventListener('hashchange', listener);
    };
  }, []);

  return useMemo(() => [path, navigate], [path]);
};

export default useHashLocation;
