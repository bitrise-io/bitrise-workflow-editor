import { Box } from '@bitrise/bitkit';
import { Redirect, Router, Switch } from 'wouter';

import Header from '@/components/Header';
import LazyRoute from '@/components/LazyRoute';
import Navigation from '@/components/Navigation';
import useHashLocation from '@/hooks/useHashLocation';
import useHashSearch from '@/hooks/useHashSearch';
import useMergedConfigSync from '@/hooks/useMergedConfigSync';
import { useTree } from '@/hooks/useTree';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';
import OpenFileTabs from '@/pages/YmlPage/components/OpenFileTabs/OpenFileTabs';
import { paths, routes } from '@/routes';

const InvalidYmlRedirect = () => {
  const ymlStatus = useYmlValidationStatus();
  const [currentPath] = useHashLocation();

  if (ymlStatus !== 'invalid' || currentPath.startsWith(paths.yml)) {
    return null;
  }

  const redirectTo = currentPath.includes('?')
    ? `${paths.yml}${currentPath.substring(currentPath.indexOf('?'))}`
    : paths.yml;

  return <Redirect to={redirectTo} replace />;
};

const MainLayout = () => {
  // Modular configs get a global file-tab strip pinned to the top of the editor
  // area (a continuation of the ConfigSettingsBar "in repository" header), so the
  // active file is one shared context across every view.
  const isModular = Boolean(useTree());

  // Fetch + bind the merged config whenever the Merged tab is active (works on
  // every page, so entity cards on the merged view resolve locally).
  useMergedConfigSync();

  return (
    <Box h="100dvh" display="flex" flexDirection="column">
      <Header />
      <Box display="flex" flex="1" alignItems="stretch" minH={0}>
        <Navigation borderRight="1px solid" borderColor="border/regular" />
        <Box flex="1" display="flex" flexDirection="column" minW={0} minH={0}>
          {isModular && <OpenFileTabs />}
          <Box flex="1" overflowX="hidden" overflowY="auto">
            <Router hook={useHashLocation} searchHook={useHashSearch}>
              <InvalidYmlRedirect />
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
    </Box>
  );
};

export default MainLayout;
