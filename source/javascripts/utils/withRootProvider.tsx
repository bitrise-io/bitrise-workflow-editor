import { ComponentProps, ReactNode, useEffect } from 'react';

import { Provider } from '@bitrise/bitkit';
import { ErrorBoundary } from '@datadog/browser-rum-react';

import createSharedContext from './createSharedContext';
import withQueryClientProvider from './withQueryClientProvider';

const PassThroughFallback: ComponentProps<typeof ErrorBoundary>['fallback'] = ({ resetError }) => {
  useEffect(() => {
    resetError();
  }, [resetError]);

  return null;
};

const Root = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <ErrorBoundary fallback={PassThroughFallback}>
      <Provider>{children}</Provider>
    </ErrorBoundary>
  );
};

const { component: RootComponent, use: withRootProvider } = createSharedContext(withQueryClientProvider(Root));

export { RootComponent, withRootProvider };
