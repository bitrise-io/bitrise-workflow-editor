import { Box } from '@chakra-ui/react/box';
import { Redirect, Router, Switch } from 'wouter';

import Header from '@/components/Header';
import LazyRoute from '@/components/LazyRoute';
import LoadingState from '@/components/LoadingState';
import Navigation from '@/components/Navigation';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useHashLocation from '@/hooks/useHashLocation';
import useHashSearch from '@/hooks/useHashSearch';
import useMergedConfigSync from '@/hooks/useMergedConfigSync';
import { useTree } from '@/hooks/useTree';
import { useIsConfigLoading } from '@/layouts/ConfigLoading.context';
import InvalidYmlRedirect from '@/layouts/InvalidYmlRedirect';
import OpenFileTabs from '@/pages/YmlPage/components/OpenFileTabs/OpenFileTabs';
import { paths, routes } from '@/routes';

const MainLayout = () => {
  const [currentPath] = useHashLocation();
  const isYmlPage = currentPath.startsWith(paths.yml);
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  // Modular configs get a global file-tab strip directly under the header.
  const isModular = Boolean(useTree());
  // In website mode that strip spans the full width under the header (above the
  // nav + content row); in CLI mode the tabs live inside the content column instead.
  const tabsUnderHeader = isModular && isWebsiteMode;

  // The header + navigation stay visible during the initial config load; only the content area
  // shows the loading state (settings check + tree/legacy fetch).
  const isConfigLoading = useIsConfigLoading();

  useMergedConfigSync();

  return (
    <Box height="100dvh" display="flex" flexDirection="column">
      <Header />
      {tabsUnderHeader && <OpenFileTabs />}
      <Box display="flex" flex="1" minHeight={0}>
        {/* style instead of conditional unmount — keeps CI_CONFIG_RECEIVED / REQUEST_AI_DRAWER_OPEN listeners alive on the YAML page. */}
        <Navigation
          borderRight="1px solid"
          borderColor="border/regular"
          style={{ display: isYmlPage ? 'none' : undefined }}
        />
        <Box display="flex" flexDirection="column" flex="1" minWidth={0} minHeight={0}>
          {isModular && !tabsUnderHeader && <OpenFileTabs />}
          <Box flex="1" overflowX="hidden" overflowY="auto">
            {isConfigLoading ? (
              <LoadingState />
            ) : (
              <Router hook={useHashLocation} searchHook={useHashSearch}>
                <InvalidYmlRedirect />
                <Switch>
                  {routes.map(({ path, component }) => (
                    <LazyRoute key={path} path={new RegExp(`^\\${path}`)} component={component} />
                  ))}
                  <Redirect to={paths.workflows} replace />
                </Switch>
              </Router>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
