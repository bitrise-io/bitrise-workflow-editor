import { Box } from '@bitrise/bitkit';
import { Redirect, Router, Switch } from 'wouter';

import Header from '@/components/Header';
import LazyRoute from '@/components/LazyRoute';
import Navigation from '@/components/Navigation';
import useHashLocation from '@/hooks/useHashLocation';
import useHashSearch from '@/hooks/useHashSearch';
import { paths, routes } from '@/routes';

const MainLayout = () => {
  return (
    <Box h="100dvh" display="flex" flexDirection="column">
      <Header />
      <Box display="flex" flex="1" alignItems="stretch" minH={0}>
        <Navigation borderRight="1px solid" borderColor="border/regular" pt="24" />
        <Box flex="1" overflowX="hidden" overflowY="auto">
          <Router hook={useHashLocation} searchHook={useHashSearch}>
            <Switch>
              {routes.map(({ path, component }) => (
                <LazyRoute key={path} path={new RegExp(`^\\${path}`)} component={component} />
              ))}
              <Redirect to={paths.workflows} replace />
            </Switch>
          </Router>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
