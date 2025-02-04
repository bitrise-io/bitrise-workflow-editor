import { ErrorInfo, ReactNode, useEffect } from 'react';
import { theme } from '@bitrise/bitkit';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ChakraProvider, mergeThemeOverride } from '@chakra-ui/react';

import { datadogRum } from '@datadog/browser-rum';
import createSharedContext from './createSharedContext';
import withQueryClientProvider from './withQueryClientProvider';

const wfeTheme = mergeThemeOverride(theme, {
  styles: {
    global: {
      svg: { display: 'inline' },
      select: { padding: '7px 32px 7px 12px' },
    },
  },
});

const PassThroughFallback = ({ resetErrorBoundary }: FallbackProps) => {
  useEffect(() => {
    resetErrorBoundary();
  }, [resetErrorBoundary]);

  return null;
};

const logErrorToDataDog = (error: Error, info: ErrorInfo) => {
  const renderingError = new Error(error.message);

  renderingError.name = error.name;
  renderingError.stack = info.componentStack || error.stack;

  datadogRum.addError(renderingError);
};

const Root = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <ErrorBoundary onError={logErrorToDataDog} FallbackComponent={PassThroughFallback}>
      <ChakraProvider theme={wfeTheme}>{children}</ChakraProvider>
    </ErrorBoundary>
  );
};

const { component: RootComponent, use: withRootProvider } = createSharedContext(withQueryClientProvider(Root));

export { RootComponent, withRootProvider };
