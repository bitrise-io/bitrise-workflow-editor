import { Suspense } from 'react';
import { Route, RouteProps } from 'wouter';
import LoadingState from '@/components/LoadingState';
import Discardable from '@/components/Discardable';

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
