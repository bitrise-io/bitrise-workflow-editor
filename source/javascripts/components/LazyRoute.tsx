import { Suspense } from 'react';
import { Route, RouteProps } from 'wouter';

import ChunkLoadErrorBoundary from '@/components/ChunkLoadErrorBoundary';
import Discardable from '@/components/Discardable';
import LoadingState from '@/components/LoadingState';
import PageProps from '@/core/utils/PageProps';
import { useGetCiConfig } from '@/hooks/useCiConfig';

const LazyRoute = (props: RouteProps) => {
  const { isLoading } = useGetCiConfig({ projectSlug: PageProps.appSlug(), skipValidation: true });

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ChunkLoadErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <Discardable>
          <Route {...props} />
        </Discardable>
      </Suspense>
    </ChunkLoadErrorBoundary>
  );
};

export default LazyRoute;
