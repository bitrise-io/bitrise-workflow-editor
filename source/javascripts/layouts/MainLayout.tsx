import { Box } from '@chakra-ui/react/box';
import { Suspense, useState } from 'react';
import { Redirect, Router, Switch } from 'wouter';

import Discardable from '@/components/Discardable';
import Header from '@/components/Header';
import LazyRoute from '@/components/LazyRoute';
import LoadingState from '@/components/LoadingState';
import Navigation from '@/components/Navigation';
import FirstBuildingBlock from '@/components/Navigation/firstBuildingBlock';
import ToolPanel, { BehindToolPanelProvider } from '@/components/Navigation/ToolPanel';
import TOOLS from '@/components/Navigation/tools';
import { useCloseToolPanel, useLastBlock } from '@/components/Navigation/useOpenBuildingBlock';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useHashLocation from '@/hooks/useHashLocation';
import useHashSearch from '@/hooks/useHashSearch';
import useMergedConfigSync from '@/hooks/useMergedConfigSync';
import useTrackYamlAliases from '@/hooks/useTrackYamlAliases';
import { useTree } from '@/hooks/useTree';
import { useIsConfigLoading } from '@/layouts/ConfigLoading.context';
import VisualEditorDisabledRedirect from '@/layouts/VisualEditorDisabledRedirect';
import OpenFileTabs from '@/pages/YmlPage/components/OpenFileTabs/OpenFileTabs';
import { paths, routes } from '@/routes';

const useBehindToolPath = () => {
  const lastBlockPath = useLastBlock((s) => (s.isYamlView ? paths.yml : s.target?.path));
  const firstBlockPath = useBitriseYmlStore((s) => FirstBuildingBlock.firstBuildingBlock(s.yml)?.path);
  return lastBlockPath ?? firstBlockPath ?? paths.workflows;
};

const isToolPath = (path: string) => TOOLS.some((tool) => path.startsWith(tool.path));

// The content area's location. While a tool is open it's the page the tool's panel opened over (the YAML page
// or the last CI block), so that page stays mounted, unchanged, as the panel opens and closes.
const useContentLocation = (() => {
  const [path, navigate] = useHashLocation();
  const behindPath = useBehindToolPath();
  return [isToolPath(path) ? behindPath : path, navigate];
}) as typeof useHashLocation;

const MainLayout = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  // Modular configs get a global file-tab strip directly under the header.
  const isModular = Boolean(useTree());
  // In website mode that strip spans the full width under the header (above the
  // nav + content row); in CLI mode the tabs live inside the content column instead.
  const tabsUnderHeader = isModular && isWebsiteMode;

  // The header + navigation stay visible during the initial config load; only the content area
  // shows the loading state (settings check + tree/legacy fetch).
  const isConfigLoading = useIsConfigLoading();

  // Tool pages (Env Vars, Secrets, …) open in a panel over the YAML page or the last CI block, whichever
  // was open; closing it returns there.
  const [currentPath] = useHashLocation();
  const isToolPage = isToolPath(currentPath);
  const closeToolPanel = useCloseToolPanel();
  // The panel keeps showing the last tool while it slides away.
  const toolRoute = isToolPage ? routes.find(({ path }) => currentPath.startsWith(path)) : undefined;
  const [shownToolRoute, setShownToolRoute] = useState(toolRoute);
  if (toolRoute && toolRoute !== shownToolRoute) {
    setShownToolRoute(toolRoute);
  }
  const ShownTool = shownToolRoute?.component;
  const pageRouter = (
    <Router hook={useContentLocation} searchHook={useHashSearch}>
      <VisualEditorDisabledRedirect>
        <Switch>
          {routes.map(({ path, component }) => (
            <LazyRoute key={path} path={new RegExp(`^\\${path}`)} component={component} />
          ))}
          <Redirect to={paths.workflows} replace />
        </Switch>
      </VisualEditorDisabledRedirect>
    </Router>
  );

  useMergedConfigSync();
  useTrackYamlAliases();

  return (
    <Box height="100dvh" display="flex" flexDirection="column">
      <Header />
      {tabsUnderHeader && <OpenFileTabs />}
      {/* Positioned, so an open tool panel can float over the sidebar's list and the content alike. */}
      <Box display="flex" flex="1" minHeight={0} position="relative">
        {/* Shown on the YAML page too: there, its CI blocks jump to definitions in the editor. */}
        <Navigation />
        {!isConfigLoading && ShownTool && (
          <ToolPanel isOpen={isToolPage} onClose={closeToolPanel}>
            <Suspense fallback={<LoadingState />}>
              <Discardable>
                <ShownTool />
              </Discardable>
            </Suspense>
          </ToolPanel>
        )}
        <Box display="flex" flexDirection="column" flex="1" minWidth={0} minHeight={0}>
          {isModular && !tabsUnderHeader && <OpenFileTabs />}
          <Box flex="1" overflowX="hidden" overflowY="auto" position="relative">
            {isConfigLoading && <LoadingState isCanvas />}
            {/* A tool page opens in a panel over the YAML or CI block you were on, which stays on screen behind it. */}
            {!isConfigLoading && <BehindToolPanelProvider isBehind={isToolPage}>{pageRouter}</BehindToolPanelProvider>}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
