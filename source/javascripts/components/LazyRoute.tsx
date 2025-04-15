import { Suspense } from 'react';
import { Route, RouteProps } from 'wouter';

import Discardable from '@/components/Discardable';
import LoadingState from '@/components/LoadingState';

const LazyRoute = (props: RouteProps) => {
  return (
    <Suspense fallback={<LoadingState />}>
      <Discardable>
        <Route {...props} />
      </Discardable>
    </Suspense>
  );
};

export default LazyRoute;
