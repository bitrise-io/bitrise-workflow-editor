import { Box } from '@bitrise/bitkit';
import { Redirect, Router, Switch } from 'wouter';

import Header from '@/components/Header';
import LazyRoute from '@/components/LazyRoute';
import Navigation from '@/components/Navigation';
import ConfigSettingsBar from '@/components/unified-editor/ConfigSettingsBar/ConfigSettingsBar';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
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
  const [currentPath] = useHashLocation();
  const isYmlPage = currentPath.startsWith(paths.yml);
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  // Modular configs get a global file-tab strip atop the editor area.
  const isModular = Boolean(useTree());
  // With the bar present, the tab strip shares its 48px top row (so it doesn't jump
  // between Visual and YAML mode); without it, the strip tops the content area instead.
  const tabsBesideBar = isModular && isWebsiteMode;

  useMergedConfigSync();

  // Non-modular keeps the original layout: full-width bar on the YAML page, no tabs row.
  const gridTemplateColumns = isYmlPage && !isModular ? '1fr' : '256px 1fr';
  let gridTemplateAreas = tabsBesideBar ? `"bar tabs" "nav content"` : `"bar content" "nav content"`;
  if (isYmlPage) {
    gridTemplateAreas = isModular ? `"bar tabs" "content content"` : `"bar" "content"`;
  }

  return (
    <Box h="100dvh" display="flex" flexDirection="column">
      <Header />
      <Box
        display="grid"
        flex="1"
        minH={0}
        gridTemplateColumns={gridTemplateColumns}
        gridTemplateRows="auto 1fr"
        gridTemplateAreas={gridTemplateAreas}
      >
        {isWebsiteMode && (
          <ConfigSettingsBar
            gridArea="bar"
            showValidationBadge={isYmlPage}
            justifyContent={isYmlPage && !isModular ? 'flex-start' : 'space-between'}
            borderRight={isYmlPage && !isModular ? undefined : '1px solid'}
            borderRightColor={isYmlPage && !isModular ? undefined : 'border/regular'}
          />
        )}
        {tabsBesideBar && (
          <Box gridArea="tabs" minW={0}>
            <OpenFileTabs />
          </Box>
        )}
        {/* style instead of conditional unmount — keeps CI_CONFIG_RECEIVED / REQUEST_AI_DRAWER_OPEN listeners alive on the YAML page. */}
        <Navigation
          gridArea="nav"
          borderRight="1px solid"
          borderColor="border/regular"
          style={{ display: isYmlPage ? 'none' : undefined }}
        />
        <Box gridArea="content" display="flex" flexDirection="column" minW={0} minH={0}>
          {isModular && !tabsBesideBar && <OpenFileTabs />}
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
