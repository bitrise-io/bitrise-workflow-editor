import { ComponentProps, PropsWithChildren, StrictMode, useEffect } from 'react';
import { Box, Provider as BitkitProvider } from '@bitrise/bitkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { Redirect, Router, Switch } from 'wouter';
import { ReactFlowProvider } from '@xyflow/react';
import { ErrorBoundary } from '@datadog/browser-rum-react';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import Client from '@/core/api/client';
import { paths, routes } from '@/routes';
import Navigation from '@/components/Navigation';
import Header from '@/components/Header';
import LazyRoute from '@/components/LazyRoute';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import { useGetCiConfigJson, useGetCiConfigYml } from '@/hooks/useCiConfig';
import useHashLocation from '@/hooks/useHashLocation';
import useHashSearch from '@/hooks/useHashSearch';

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

const App = () => {
  return (
    <StrictMode>
      <ErrorBoundary fallback={PassThroughFallback}>
        <QueryClientProvider client={DefaultQueryClient}>
          <ReactFlowProvider>
            <BitkitProvider>
              <InitialDataLoader>
                <Layout />
              </InitialDataLoader>
            </BitkitProvider>
          </ReactFlowProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

const InitialDataLoader = ({ children }: PropsWithChildren) => {
  // TODO: Handle errors
  const { data: initialCiConfigYml } = useGetCiConfigYml({
    projectSlug: PageProps.appSlug(),
  });
  const { data: initialCiConfigJson } = useGetCiConfigJson({
    projectSlug: PageProps.appSlug(),
  });

  useEffect(() => {
    bitriseYmlStore.setState({
      yml: initialCiConfigJson,
      savedYml: initialCiConfigJson,
      ymlString: initialCiConfigYml,
      savedYmlString: initialCiConfigYml,
    });
  }, [initialCiConfigYml, initialCiConfigJson]);

  if (!initialCiConfigYml || !initialCiConfigJson) {
    // TODO: Loading state
    return null;
  }

  return <>{children}</>;
};

const Layout = () => {
  return (
    <Box h="100dvh" display="flex" flexDirection="column">
      <Header />
      <Box display="flex" flex="1" alignItems="stretch">
        <Navigation borderRight="1px solid" borderColor="border/regular" />
        <Box flex="1" overflowX="hidden" overflowY="auto">
          <Router hook={useHashLocation} searchHook={useHashSearch}>
            <Switch>
              {routes.map(({ path, component }) => (
                <LazyRoute key={path} path={new RegExp(`^\\${path}`)} component={component} />
              ))}
              <Redirect to={paths.workflows} replace />
            </Switch>
          </Router>
        </Box>
      </Box>
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
