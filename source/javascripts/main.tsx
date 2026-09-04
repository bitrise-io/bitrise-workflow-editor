/* _eslint-disable import/no-import-module-exports */
import '@/monaco-workers';

import { Provider } from '@bitrise/bitkit';
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { ComponentProps, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Client from '@/core/api/client';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import InitialDataLoader from '@/layouts/InitialDataLoader';
import MainLayout from '@/layouts/MainLayout';

const loaders = [];
if (import.meta.env.CLARITY === 'true') {
  loaders.push(import('./lib/clrty'));
}
if (import.meta.env.DATADOG_RUM === 'true') {
  loaders.push(import('./lib/ddrum'));
}
if (import.meta.env.INTERCOM_APP_ID) {
  loaders.push(import('./lib/intrcm'));
}

try {
  await Promise.all(loaders);
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Error loading optional libraries:', e);
}

if (RuntimeUtils.isProduction() && RuntimeUtils.isLocalMode()) {
  // NOTE: The API server running in local mode, has a built-in termination timer
  // This will stop the termination timer when the window is loaded
  window.addEventListener('load', () => Client.post('/api/connection'), {
    once: true,
  });
  // This will restart the termination timer when the window is closed
  window.addEventListener('beforeunload', () => Client.del('/api/connection'), {
    once: true,
  });
}

const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class extends OriginalResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    const wrappedCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      window.requestAnimationFrame(() => {
        callback(entries, observer);
      });
    };
    super(wrappedCallback);
  }
};

const DefaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

// Module-scoped, not a ref: the boundary mounts a fresh fallback for every throw, so per-instance
// state would reset each time and retry forever.
let hasRetriedRenderError = false;

/**
 * Retries once, so a transient error still passes through unnoticed, then stops and admits it can't
 * recover. It has to stop: unsaved YAML now survives a remount (see ConfigLoadTracker), so a
 * deterministic error no longer heals itself by reloading the saved config over the user's edits.
 *
 * This only fires for a failure in the providers, InitialDataLoader or Header. A page that throws is
 * caught by PageErrorBoundary, which keeps the navigation and can route to the YAML editor. Here
 * there is no chrome and no route left, so reloading is the only exit and it discards the edits.
 * Hence the copy button: it is the last point at which that YAML still exists.
 */
const RenderErrorFallback: ComponentProps<typeof ErrorBoundary>['fallback'] = ({ error, resetError }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hasRetriedRenderError) {
      hasRetriedRenderError = true;
      resetError();
      return;
    }
    // Datadog only receives this in website mode, so log it unconditionally for CLI/plugin runs.
    // eslint-disable-next-line no-console
    console.error('Workflow Editor failed to render:', error);
  }, [error, resetError]);

  if (!hasRetriedRenderError) {
    return null;
  }

  const copyUnsavedYml = () => {
    navigator.clipboard.writeText(getYmlString()).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  // Deliberately plain markup: the fallback replaces everything inside the boundary, including the
  // theme providers, so it cannot rely on Bitkit or Chakra components rendering correctly here.
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>The editor can&apos;t recover from this error</h2>
      <p style={{ margin: '0 0 16px', maxWidth: '52ch' }}>
        Reloading fixes the page but discards any changes you hadn&apos;t saved. Copy your configuration first if you
        want to keep it.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={copyUnsavedYml}>
          {copied ? 'Copied' : 'Copy configuration'}
        </button>
        <button type="button" onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <StrictMode>
      <ErrorBoundary fallback={RenderErrorFallback}>
        <QueryClientProvider client={DefaultQueryClient}>
          <ReactFlowProvider>
            <Provider resetCSS={false}>
              <BitkitProvider>
                <InitialDataLoader>
                  <MainLayout />
                </InitialDataLoader>
              </BitkitProvider>
            </Provider>
          </ReactFlowProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
