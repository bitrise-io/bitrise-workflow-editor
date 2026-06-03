/* _eslint-disable import/no-import-module-exports */
import '@/monaco-workers';

import { Box, Button, Image, Link, Provider, Text, useToast } from '@bitrise/bitkit';
import { BitkitProvider } from '@bitrise/bitkit-v2';
import { datadogRum } from '@datadog/browser-rum';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactFlowProvider } from '@xyflow/react';
import { ComponentProps, PropsWithChildren, StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useEventListener } from 'usehooks-ts';

import Client from '@/core/api/client';
import { initializeBitriseYmlDocument, initializeModularConfig } from '@/core/stores/BitriseYmlStore';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useGetCiConfig } from '@/hooks/useCiConfig';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import { useGetCiConfigTree } from '@/hooks/useCiConfigTree';
import useCloseAIDrawer from '@/hooks/useCloseAIDrawer';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useSearchParams from '@/hooks/useSearchParams';
import useYmlLanguageServices from '@/hooks/useYmlLanguageServices';
import MainLayout from '@/layouts/MainLayout';

import bitriseLogo from '../images/bitrise-logo.svg';
import errorImg from '../images/error-hairball.svg';
import { trackConfigBranchLoaded } from './core/analytics/ConfigManagementAnalytics';
import useYmlHasChanges from './hooks/useYmlHasChanges';
import { preloadRoutes } from './routes';

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

const PassThroughFallback: ComponentProps<typeof ErrorBoundary>['fallback'] = ({ resetError }) => {
  useEffect(() => {
    resetError();
  }, [resetError]);

  return null;
};

const InitialDataLoader = ({ children }: PropsWithChildren) => {
  const toast = useToast();
  const isLoaded = useRef(false);
  const isTracked = useRef(false);
  const loadedBranch = useRef<string | undefined | null>(null);
  const hasChanges = useYmlHasChanges();
  const [searchParams] = useSearchParams();
  const requestedBranch = RuntimeUtils.isWebsiteMode() ? searchParams.branch : undefined;

  const { data: ymlSettings } = useCiConfigSettings();
  useYmlLanguageServices();
  useCloseAIDrawer();

  // Tree bootstrap, gated behind the modular flag. When off, the existing
  // single-file flow (legacy `GET /config`) is the only path. When on,
  // `getConfig` always returns a tree — a non-modular config is just a
  // single-node tree — which seeds the tree store. The modular UI mounts in
  // later tasks; for a single-node tree it behaves exactly as the single-file
  // editor (the active file IS the document).
  const isModularEnabled = useFeatureFlag('enable-wfe-modular-yaml-editing');

  const legacyConfig = useGetCiConfig(
    { projectSlug: PageProps.appSlug(), skipValidation: true, branch: requestedBranch },
    { enabled: !isModularEnabled },
  );
  const treeConfig = useGetCiConfigTree(
    { projectSlug: PageProps.appSlug(), branch: requestedBranch },
    { enabled: isModularEnabled },
  );

  const { data, error, refetch } = isModularEnabled ? treeConfig : legacyConfig;
  const configBranch = isModularEnabled ? treeConfig.data?.branch : legacyConfig.data?.branch;

  useEventListener('beforeunload', (e) => {
    // NOTE: The return is important for the browser to show the dialog
    return RuntimeUtils.isProduction() && hasChanges && e.preventDefault();
  });

  useEventListener('error', (e) => {
    datadogRum.addError(e);
    toast({ duration: null, status: 'error', isClosable: true, description: e.message || 'Unknown error' });
  });

  useEventListener('unhandledrejection', (e) => {
    // Monaco cancels in-flight debounced tasks (Delayer) when its editor model is
    // disposed — e.g. navigating away from a source view while switching tabs —
    // rejecting with a benign "Canceled" sentinel. It's not a real error, so
    // don't report it or surface an error toast.
    const reason = e.reason as { name?: string; message?: string } | undefined;
    if (reason?.name === 'Canceled' || reason?.message === 'Canceled') {
      return;
    }
    datadogRum.addError(e.reason);
    toast({ duration: null, status: 'error', isClosable: true, description: e.reason?.message || 'Unknown error' });
  });

  useEffect(() => {
    if (data && loadedBranch.current !== requestedBranch) {
      if (isModularEnabled) {
        const config = treeConfig.data;
        if (config) {
          initializeModularConfig({
            root: config.root,
            entityIndex: config.entityIndex,
            mergedYml: config.mergedYml,
            branch: config.branch,
            commitSha: config.root.commitSha,
          });
        }
      } else if (legacyConfig.data) {
        initializeBitriseYmlDocument(legacyConfig.data);
      }

      if (requestedBranch) {
        if (configBranch && configBranch === requestedBranch) {
          toast({
            status: 'success',
            isClosable: true,
            description: `Configuration is loaded from ${requestedBranch} branch.`,
          });
        } else if (configBranch && configBranch !== requestedBranch) {
          toast({
            status: 'warning',
            isClosable: true,
            description: `Config unavailable on ${requestedBranch}. Using ${configBranch} (default branch).`,
          });
        }
      }
      loadedBranch.current = requestedBranch;
      if (!isLoaded.current) {
        setTimeout(preloadRoutes, 1000);
        isLoaded.current = true;
      }
    }
  }, [data, requestedBranch, toast, isModularEnabled, legacyConfig.data, treeConfig.data, configBranch]);

  useEffect(() => {
    if (data && ymlSettings?.usesRepositoryYml && !isTracked.current) {
      isTracked.current = true;
      trackConfigBranchLoaded(configBranch);
    }
  }, [data, ymlSettings?.usesRepositoryYml, configBranch]);

  if (error) {
    let detailedErrorMessage = 'Error - Failed to load the bitrise.yml';
    if (error.status) {
      if (error.data?.error_msg) {
        detailedErrorMessage = `${error.status} - ${error.data.error_msg}`;
      } else if (error.statusText) {
        detailedErrorMessage = `${error.status} - ${error.statusText}`;
      }
    }

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
              {detailedErrorMessage}
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
