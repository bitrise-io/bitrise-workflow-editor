import { Suspense } from 'react';
import { Route, RouteProps } from 'wouter';

import Discardable from '@/components/Discardable';
import LoadingState from '@/components/LoadingState';
import PageProps from '@/core/utils/PageProps';
import { useGetCiConfig } from '@/hooks/useCiConfig';

const LazyRoute = (props: RouteProps) => {
  const { isLoading } = useGetCiConfig({ projectSlug: PageProps.appSlug() });

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <Discardable>
        <Route {...props} />
      </Discardable>
    </Suspense>
  );
};

export default LazyRoute;
