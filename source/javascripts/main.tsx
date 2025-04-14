import { ComponentProps, PropsWithChildren, StrictMode, useEffect, useRef } from 'react';
import { Provider as BitkitProvider } from '@bitrise/bitkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import { ErrorBoundary } from '@datadog/browser-rum-react';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import Client from '@/core/api/client';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import { useGetCiConfigJson, useGetCiConfigYml } from '@/hooks/useCiConfig';
import MainLayout from '@/layouts/MainLayout';

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

const DefaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

const PassThroughFallback: ComponentProps<typeof ErrorBoundary>['fallback'] = ({ resetError }) => {
  useEffect(() => {
    resetError();
  }, [resetError]);

  return null;
};

const App = () => {
  return (
    <StrictMode>
      <ErrorBoundary fallback={PassThroughFallback}>
        <QueryClientProvider client={DefaultQueryClient}>
          <ReactFlowProvider>
            <BitkitProvider>
              <InitialDataLoader>
                <MainLayout />
              </InitialDataLoader>
            </BitkitProvider>
          </ReactFlowProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

const InitialDataLoader = ({ children }: PropsWithChildren) => {
  const isLoaded = useRef(false);

  // TODO: Handle errors
  const { data: initialCiConfigYml } = useGetCiConfigYml({
    projectSlug: PageProps.appSlug(),
  });
  const { data: initialCiConfigJson } = useGetCiConfigJson({
    projectSlug: PageProps.appSlug(),
  });

  useEffect(() => {
    if (!isLoaded.current && initialCiConfigYml && initialCiConfigJson) {
      bitriseYmlStore.setState({
        yml: initialCiConfigJson.data,
        savedYml: initialCiConfigJson.data,
        savedYmlVersion: initialCiConfigJson.version,
        ymlString: initialCiConfigYml.data,
        savedYmlString: initialCiConfigYml.data,
        savedYmlStringVersion: initialCiConfigYml.version,
      });
      isLoaded.current = true;
    }
  }, [initialCiConfigYml, initialCiConfigJson]);

  if (!initialCiConfigYml || !initialCiConfigJson) {
    // TODO: Loading state
    return null;
  }

  return <>{children}</>;
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
