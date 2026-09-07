/* _eslint-disable import/no-import-module-exports */
import '@/monaco-workers';

import { Provider } from '@bitrise/bitkit';
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { ComponentProps, StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import Client from '@/core/api/client';
import { createResetBudget } from '@/core/utils/resetBudget';
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

// The fallback resets the boundary so a transient render error doesn't leave the whole editor
// blanked out. A *deterministic* one re-throws on the very next render though, and resetting again
// spins that into an unbounded render loop that re-reports the same error to RUM thousands of times
// in a single session. The budget stops that after a burst, while still letting spaced-out transient
// failures recover; the errors still reach RUM, but once per occurrence rather than as a storm.
//
// Module scope on purpose: the fallback unmounts on every successful reset, so component state
// cannot see how many times it has already retried.
const resetBudget = createResetBudget({ maxResets: 3, windowMs: 1000 });

const PassThroughFallback: ComponentProps<typeof ErrorBoundary>['fallback'] = ({ resetError }) => {
  useEffect(() => {
    if (resetBudget.tryConsume()) {
      resetError();
    }
  }, [resetError]);

  return null;
};

const App = () => {
  return (
    <StrictMode>
      <ErrorBoundary fallback={PassThroughFallback}>
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
