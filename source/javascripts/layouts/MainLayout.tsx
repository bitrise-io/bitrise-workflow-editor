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
import useTrackYamlAliases from '@/hooks/useTrackYamlAliases';
import { useTree } from '@/hooks/useTree';
import { useIsConfigLoading } from '@/layouts/ConfigLoading.context';
import VisualEditorDisabledRedirect from '@/layouts/VisualEditorDisabledRedirect';
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

  // The YAML view keeps the sidebar for a modular config, but only its module tree: the page navigation
  // collapses away. A single-file config has no tree, so its YAML view keeps the full-width editor.
  const showSidebar = !isYmlPage || isModular;

  useMergedConfigSync();
  useTrackYamlAliases();

  return (
    <Box height="100dvh" display="flex" flexDirection="column">
      <Header />
      {tabsUnderHeader && <OpenFileTabs />}
      <Box display="flex" flex="1" minHeight={0}>
        {/* style instead of conditional unmount — keeps CI_CONFIG_RECEIVED / REQUEST_AI_DRAWER_OPEN listeners alive on the YAML page. */}
        <Navigation
          style={{ display: showSidebar ? undefined : 'none' }}
          // Only a modular config keeps the sidebar in the YAML view; a single-file one hides it whole, so
          // its nav never collapses (and never waits for an expand transition to get its scrollbar back).
          hidePageNav={isYmlPage && isModular}
        />
        <Box display="flex" flexDirection="column" flex="1" minWidth={0} minHeight={0}>
          {isModular && !tabsUnderHeader && <OpenFileTabs />}
          <Box flex="1" overflowX="hidden" overflowY="auto">
            {isConfigLoading ? (
              <LoadingState />
            ) : (
              <Router hook={useHashLocation} searchHook={useHashSearch}>
                <VisualEditorDisabledRedirect>
                  <Switch>
                    {routes.map(({ path, component }) => (
                      <LazyRoute key={path} path={new RegExp(`^\\${path}`)} component={component} />
                    ))}
                    <Redirect to={paths.workflows} replace />
                  </Switch>
                </VisualEditorDisabledRedirect>
              </Router>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
