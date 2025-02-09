import { ErrorInfo, ReactNode, useEffect } from 'react';
import { Provider } from '@bitrise/bitkit';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import { datadogRum } from '@datadog/browser-rum';
import createSharedContext from './createSharedContext';
import withQueryClientProvider from './withQueryClientProvider';

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
      <Provider>{children}</Provider>
    </ErrorBoundary>
  );
};

const { component: RootComponent, use: withRootProvider } = createSharedContext(withQueryClientProvider(Root));

export { RootComponent, withRootProvider };
