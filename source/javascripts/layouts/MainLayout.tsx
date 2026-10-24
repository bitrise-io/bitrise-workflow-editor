import { Box } from '@chakra-ui/react/box';
import { Suspense } from 'react';
import { Redirect, Router, Switch } from 'wouter';

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
  const isToolPage = TOOLS.some((tool) => currentPath.startsWith(tool.path));
  const lastBlockPath = useLastBlock((s) => (s.isYamlView ? paths.yml : s.target?.path));
  const firstBlockPath = useBitriseYmlStore((s) => FirstBuildingBlock.firstBuildingBlock(s.yml)?.path);
  const BehindPage = routes.find(
    ({ path }) => path === (lastBlockPath ?? firstBlockPath ?? paths.workflows),
  )?.component;
  const closeToolPanel = useCloseToolPanel();
  const pageRouter = (
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
        {!isConfigLoading && isToolPage && <ToolPanel onClose={closeToolPanel}>{pageRouter}</ToolPanel>}
        <Box display="flex" flexDirection="column" flex="1" minWidth={0} minHeight={0}>
          {isModular && !tabsUnderHeader && <OpenFileTabs />}
          <Box flex="1" overflowX="hidden" overflowY="auto" position="relative">
            {isConfigLoading && <LoadingState />}
            {/* A tool page opens in a panel over the YAML or CI block you were on, which stays on screen behind it. */}
            {!isConfigLoading && isToolPage && BehindPage && (
              <BehindToolPanelProvider>
                <Suspense fallback={<LoadingState />}>
                  <BehindPage />
                </Suspense>
              </BehindToolPanelProvider>
            )}
            {!isConfigLoading && !isToolPage && pageRouter}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
