import { Box } from '@bitrise/bitkit';
import { useMemo } from 'react';
import { Redirect, Router, Switch } from 'wouter';

import FileTabsBar from '@/components/FileTabsBar';
import Header from '@/components/Header';
import LazyRoute from '@/components/LazyRoute';
import Navigation from '@/components/Navigation';

import EditabilityContext from '@/contexts/EditabilityContext';
import useHashLocation from '@/hooks/useHashLocation';
import useHashSearch from '@/hooks/useHashSearch';
import useIsModular from '@/hooks/useIsModular';
import useModularConfig from '@/hooks/useModularConfig';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';
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
  const isModular = useIsModular();
  const activeFileIndex = useModularConfig((s) => s.activeFileIndex);

  const editabilityValue = useMemo(
    () => ({
      isReadOnly: isModular && activeFileIndex === -1,
    }),
    [isModular, activeFileIndex],
  );

  return (
    <Box h="100dvh" display="flex" flexDirection="column">
      <Header />
      <FileTabsBar />
      <EditabilityContext.Provider value={editabilityValue}>
        <Box display="flex" flex="1" alignItems="stretch" minH={0}>
          <Navigation borderRight="1px solid" borderColor="border/regular" pt="24" />
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
      </EditabilityContext.Provider>
    </Box>
  );
};

export default MainLayout;
