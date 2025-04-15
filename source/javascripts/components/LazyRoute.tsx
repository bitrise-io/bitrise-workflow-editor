import { Suspense } from 'react';
import { Route, RouteProps } from 'wouter';
import LoadingState from '@/components/LoadingState';

const LazyRoute = (props: RouteProps) => {
  return (
    <Suspense fallback={<LoadingState />}>
      <Route {...props} />
    </Suspense>
  );
};

export default LazyRoute;
