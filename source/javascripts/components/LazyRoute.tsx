import { Suspense } from 'react';
import { Route, RouteProps } from 'wouter';

const LazyRoute = (props: RouteProps) => {
  return (
    <Suspense>
      <Route {...props} />
    </Suspense>
  );
};

export default LazyRoute;
