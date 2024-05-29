import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

const withQueryClientProvider =
  <P extends object>(WrappedComponent: React.ComponentType<P>): React.ComponentType<P> =>
  (props) => (
    <QueryClientProvider client={queryClient}>
      <WrappedComponent {...props} />
    </QueryClientProvider>
  );

export default withQueryClientProvider;
