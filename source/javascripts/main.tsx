import { PropsWithChildren, StrictMode, useEffect } from 'react';
import { Box, Provider as BitkitProvider } from '@bitrise/bitkit';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { Redirect, Router, Switch } from 'wouter';
import { ReactFlowProvider } from '@xyflow/react';
import { queryClient } from './utils/withQueryClientProvider';
import Navigation from './components/Navigation.react';
import Header from './components/Header';
import { paths, routes } from './routes';
import LazyRoute from './components/LazyRoute';
import { useGetCiConfigJson, useGetCiConfigYml } from './hooks/useCiConfig';
import PageProps from './core/utils/PageProps';
import useHashLocation from './hooks/useHashLocation';
import useHashSearch from './hooks/useHashSearch';
import { bitriseYmlStore } from './core/stores/BitriseYmlStore';

const App = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ReactFlowProvider>
          <BitkitProvider>
            <InitialDataLoader>
              <Layout />
            </InitialDataLoader>
          </BitkitProvider>
        </ReactFlowProvider>
      </QueryClientProvider>
    </StrictMode>
  );
};

const InitialDataLoader = ({ children }: PropsWithChildren) => {
  // TODO: Handle errors
  const { data: initialCiConfigYml } = useGetCiConfigYml({ projectSlug: PageProps.appSlug() });
  const { data: initialCiConfigJson } = useGetCiConfigJson({ projectSlug: PageProps.appSlug() });

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
