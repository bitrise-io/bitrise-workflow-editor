/* _eslint-disable import/no-import-module-exports */
import '@/monaco-workers';

import { Provider } from '@bitrise/bitkit';
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Client from '@/core/api/client';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import InitialDataLoader from '@/layouts/InitialDataLoader';
import MainLayout from '@/layouts/MainLayout';
import RootErrorBoundary from '@/layouts/RootErrorBoundary';

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

const App = () => {
  return (
    <StrictMode>
      <RootErrorBoundary>
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
      </RootErrorBoundary>
    </StrictMode>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
