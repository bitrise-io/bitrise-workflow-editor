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
      const parentHash = window.parent.location.hash;
      setPath(`/${parentHash.replace(/^#?!?\/?/, '')}`);

      // Intercom boots inside this iframe's own document, so its "Current page URL contains…"
      // targeting reads THIS window's own location — but the router only ever writes to
      // window.parent's hash (whether from navigate() below, an Intercom tour step's own button,
      // or anything else touching the parent's location), so this window's location is otherwise
      // frozen at whatever it was on the iframe's initial load. Mirror the parent's hash onto our
      // own location first, so Intercom's page-URL check has something current to see, then nudge
      // it to re-evaluate. Calling Intercom('update') alone is not enough while this URL is stale.
      if (window.location.hash !== parentHash) {
        window.location.hash = parentHash;
      }
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
