import { Box, Button, Image, Link, Provider as BitkitProvider, Text } from '@bitrise/bitkit';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { ComponentProps, PropsWithChildren, StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useEventListener } from 'usehooks-ts';

import LoadingState from '@/components/LoadingState';
import Client from '@/core/api/client';
import { initializeStore } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useGetCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import MainLayout from '@/layouts/MainLayout';

import bitriseLogo from '../images/bitrise-logo.svg';
import errorImg from '../images/error-hairball.svg';
import useYmlHasChanges from './hooks/useYmlHasChanges';

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

const InitialDataLoader = ({ children }: PropsWithChildren) => {
  const isLoaded = useRef(false);
  const hasChanges = useYmlHasChanges();

  const { data, isLoading, error, refetch } = useGetCiConfig({
    projectSlug: PageProps.appSlug(),
  });

  useCiConfigSettings();
  useEventListener('beforeunload', (e) => RuntimeUtils.isProduction() && hasChanges && e.preventDefault());

  useEffect(() => {
    if (!isLoaded.current && data) {
      initializeStore(data);
      isLoaded.current = true;
    }
  }, [data]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" width="100vw" height="100vh">
        <LoadingState text="Loading bitrise.yml..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        px="5%"
        gap="3rem"
        width="100vw"
        height="100vh"
        display="flex"
        marginX="auto"
        alignItems="center"
        backgroundImage="linear-gradient(315deg, var(--colors-purple-30), var(--colors-purple-10))"
      >
        <Box display="flex" flexDir="column" gap="32" textColor="text/on-color" maxWidth="50%">
          <Link href="/" title="Go to Dashboard">
            <Image src={bitriseLogo} />
          </Link>
          <Box>
            <Text size="3" fontFamily="Source Code Pro, monospace" textTransform="uppercase" mb="16">
              {error.status && error.statusText
                ? `${error.status} - ${error.statusText}`
                : 'Error - Failed to load the bitrise.yml'}
            </Text>
            <Text textStyle="heading/h2" fontWeight="bold" fontSize="48" lineHeight="1.2">
              {error?.message}
            </Text>
          </Box>
          <Button alignSelf="start" variant="primary" size="lg" onClick={() => refetch()}>
            Try again
          </Button>
        </Box>
        <Box>
          <Image src={errorImg} />
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
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

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />);
