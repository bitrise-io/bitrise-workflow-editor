import { PropsWithChildren, StrictMode } from 'react';
import { Box, Provider as BitkitProvider } from '@bitrise/bitkit';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { noop } from 'es-toolkit';
import { Redirect, Router, Switch } from 'wouter';
import { ReactFlowProvider } from '@xyflow/react';
import { queryClient } from './utils/withQueryClientProvider';
import Navigation from './components/Navigation.react';
import Header from './components/Header';
import { paths, routes } from './routes';
import LazyRoute from './components/LazyRoute';
import BitriseYmlProvider from './contexts/BitriseYmlProvider';
import { useGetCiConfigQuery } from './hooks/useCiConfig';
import PageProps from './core/utils/PageProps';
import useHashLocation from './hooks/useHashLocation';
import useHashSearch from './hooks/useHashSearch';

const Providers = ({ children }: PropsWithChildren) => {
  const { data: yml } = useGetCiConfigQuery({ projectSlug: PageProps.appSlug() });

  if (!yml) {
    return null;
  }

  return (
    <ReactFlowProvider>
      <BitriseYmlProvider yml={yml} onChange={noop}>
        <BitkitProvider>{children}</BitkitProvider>
      </BitriseYmlProvider>
    </ReactFlowProvider>
  );
};

const App = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Providers>
          <Box h="100dvh" display="flex" flexDirection="column">
            <Header
              appName=""
              workspacePath=""
              isDiffDisabled
              isSaveDisabled
              isDiscardDisabled
              isSaveInProgress={false}
              onDiffClick={noop}
              onSaveClick={noop}
              onDiscardClick={noop}
            />
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
        </Providers>
      </QueryClientProvider>
    </StrictMode>
  );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
