import {
  BitkitControlButton,
  BitkitIconComponent,
  BitkitPageSidebar,
  BitkitToggleButton,
  createBitkitToast,
  IconBook,
  IconDoc,
  IconFolder,
  IconTerminal,
  rem,
} from '@bitrise/bitkit-v2';
import { Box, type BoxProps } from '@chakra-ui/react/box';
import { Separator } from '@chakra-ui/react/separator';
import { useCallback, useEffect, useRef, useState } from 'react';

import BuildingBlocks from '@/components/Navigation/BuildingBlocks';
import FilesPanel from '@/components/Navigation/FilesPanel';
import FirstBuildingBlock from '@/components/Navigation/firstBuildingBlock';
import TOOLS from '@/components/Navigation/tools';
import useOpenBuildingBlock, { useCloseToolPanel, useLastBlock } from '@/components/Navigation/useOpenBuildingBlock';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { bitriseYmlStore, getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import { useCiConfigExpertStore } from '@/core/stores/CiConfigExpertStore';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WindowUtils from '@/core/utils/WindowUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useCurrentPage from '@/hooks/useCurrentPage';
import useHashLocation from '@/hooks/useHashLocation';
import useParentMessageListener from '@/hooks/useParentMessageListener';
import useSearchParams, { getSearchParamsFromLocationHash } from '@/hooks/useSearchParams';
import { useTree } from '@/hooks/useTree';
import useVisualEditorNotice from '@/hooks/useVisualEditorNotice';
import { usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import { useWorkflowsPageStore } from '@/pages/WorkflowsPage/WorkflowsPage.store';

type SidebarView = 'files' | 'building-blocks';

const BUILDING_BLOCK_PAGES = ['workflows', 'pipelines', 'step_bundles'];

function usePathWithSearchParams() {
  const [searchParams] = useSearchParams();

  return useCallback(
    (path: string) => {
      const searchParamsString = new URLSearchParams(searchParams).toString();
      return searchParamsString ? `${path}?${searchParamsString}` : path;
    },
    [searchParams],
  );
}

// One square in the rail: an icon with its name as the tooltip, and the selected look when it's open.
const RailButton = ({
  icon,
  label,
  isSelected,
  onSelect,
}: {
  icon: BitkitIconComponent;
  label: string;
  isSelected: boolean;
  onSelect: VoidFunction;
}) => (
  <BitkitToggleButton
    size="md"
    borderWidth="0"
    tooltipProps={{ placement: 'right' }}
    icon={icon}
    label={label}
    isSelected={isSelected}
    onSelectedChange={onSelect}
  />
);

const Navigation = (props: BoxProps) => {
  const currentPage = useCurrentPage();
  const isDefaultTabRef = useRef(true);
  const { data } = useCiConfigSettings();
  const yamlSelector = currentPage === 'workflows' || currentPage === 'pipelines' ? currentPage : undefined;
  const [, navigate] = useHashLocation();
  const [searchParams] = useSearchParams();
  const withSearchParams = usePathWithSearchParams();
  const visualEditorNotice = useVisualEditorNotice();
  const openBuildingBlock = useOpenBuildingBlock();
  const closeToolPanel = useCloseToolPanel();
  const [view, setView] = useState<SidebarView>('building-blocks');
  // A single-file config has nothing to navigate between, so it gets no Modules.
  const tree = useTree();
  const isModular = Boolean(tree && tree.includes.length > 0);
  const visibleView = view === 'files' && !isModular ? 'building-blocks' : view;
  const currentTool = TOOLS.find((tool) => tool.page === currentPage);
  // Held here so a search survives switching to another view and back.
  const [buildingBlocksQuery, setBuildingBlocksQuery] = useState('');

  useParentMessageListener<{
    bitriseYmlContents: string;
    conversationId: string | undefined;
    turnIndex: number | undefined;
    turnCount: number | undefined;
  }>('CI_CONFIG_RECEIVED', (payload) => {
    useCiConfigExpertStore.setState({
      conversationId: payload.conversationId,
      turnIndex: payload.turnIndex,
      turnCount: payload.turnCount,
    });
    updateBitriseYmlDocumentByString(payload.bitriseYmlContents);
  });

  useParentMessageListener('REQUEST_AI_DRAWER_OPEN', () => {
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', {
      bitriseYmlContents: getYmlString(),
      selectedPage: currentPage,
      yamlSelector,
    });
    useCiConfigExpertStore.setState({ isAIDrawerOpen: true });
  });

  useEffect(() => {
    segmentTrack('Workflow Editor Tab Displayed', {
      app_slug: PageProps.appSlug(),
      tab_name: currentPage,
      is_default_tab: isDefaultTabRef.current,
      yml_source: data?.usesRepositoryYml ? 'git' : 'bitrise',
      is_modular_config: Boolean(bitriseYmlStore.getState().tree),
    });
    isDefaultTabRef.current = false;
  }, [currentPage, data?.usesRepositoryYml]);

  // Remember the last CI block a URL names, so CI blocks (and closing a tool panel) return there, and
  // whether the YAML page or a CI blocks page was open last, so a tool panel opens over that one.
  useEffect(() => {
    if (currentPage === 'yml') {
      useLastBlock.setState({ isYamlView: true });
    } else if (BUILDING_BLOCK_PAGES.includes(currentPage ?? '')) {
      useLastBlock.setState({ isYamlView: false });
    }
    const at = FirstBuildingBlock.blockAt(currentPage, searchParams);
    if (at) {
      useLastBlock.setState({ target: at });
    }
  }, [currentPage, searchParams]);

  // Switching file tabs shows that file's CI blocks wherever the canvas would otherwise not change: from a
  // tool panel, or from a kind the new file doesn't have (e.g. only Step bundles while on Pipelines). The
  // sidebar switches from Modules to CI blocks to match: picking a file shows what's in it. The YAML page
  // stays put. Only on switching files: deleting the last entity of a kind keeps you there.
  const selectedNodeId = useBitriseYmlStore((s) => s.selectedNodeId);
  const [viewNodeId, setViewNodeId] = useState(selectedNodeId);
  if (viewNodeId !== selectedNodeId) {
    setViewNodeId(selectedNodeId);
    if (view !== 'building-blocks' && currentPage !== 'yml') {
      setView('building-blocks');
    }
  }
  const previousNodeIdRef = useRef(selectedNodeId);
  useEffect(() => {
    if (previousNodeIdRef.current === selectedNodeId) {
      return;
    }
    previousNodeIdRef.current = selectedNodeId;
    const page = currentPage ?? '';
    const isBlockPage = BUILDING_BLOCK_PAGES.includes(page);
    if (currentTool && useLastBlock.getState().isYamlView) {
      closeToolPanel();
    } else if (
      page !== 'yml' &&
      (!isBlockPage || !FirstBuildingBlock.hasBlocksFor(bitriseYmlStore.getState().yml, page))
    ) {
      openBuildingBlock();
    }
    // Reacts to the file switch only; the rest is read fresh when it happens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  // Opening the editor on a CI blocks page without naming an entity lands on the highest-level block too.
  // A link that names one (e.g. from a build page) is kept. Read on first render, before any page fills
  // in a default; acted on once the config has loaded.
  const landedWithEntityRef = useRef(
    FirstBuildingBlock.entityParams.some((param) => Boolean(getSearchParamsFromLocationHash()[param])),
  );
  const hasAnyBlock = useBitriseYmlStore((s) => Boolean(FirstBuildingBlock.firstBuildingBlock(s.yml)));
  const hasLandedRef = useRef(false);
  useEffect(() => {
    if (!hasAnyBlock || hasLandedRef.current) {
      return;
    }
    hasLandedRef.current = true;
    if (!landedWithEntityRef.current && BUILDING_BLOCK_PAGES.includes(currentPage ?? '')) {
      openBuildingBlock();
    }
    // Runs once, when the config first has a block; the rest is read fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnyBlock]);

  // CI blocks and Modules show their list beside the rail, closing any tool panel by going back to what it
  // opened over. On the YAML page they stay put: there, the lists jump within the YAML.
  const showList = (next: SidebarView) => {
    setView(next);
    if (currentTool) {
      closeToolPanel();
    } else if (currentPage !== 'yml' && next === 'building-blocks') {
      openBuildingBlock();
    }
  };

  // A tool opens its page in a panel over the canvas; the canvas page's own drawer steps aside for it.
  const openTool = (path: string) => {
    if (visualEditorNotice?.disabled) {
      createBitkitToast({
        variant: visualEditorNotice.severity,
        titleText: visualEditorNotice.title,
        messageText: visualEditorNotice.description,
      });
      return;
    }
    usePipelinesPageStore.getState().closeDialog();
    useWorkflowsPageStore.getState().closeDialog();
    useStepBundlesPageStore.getState().closeDialog();
    navigate(withSearchParams(path));
  };

  return (
    // The sidebar's own labels, icons and links are the same for every user and account; the entity
    // lists and file tree inside it mask themselves.
    <Box display="flex" flexShrink={0} minHeight="0" data-clarity-unmask="true" {...props}>
      {/* The rail: CI blocks and Modules show their list beside it; each tool opens its page in a panel. */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="4"
        paddingBlock="8"
        paddingInline="8"
        borderInlineEnd="1px solid"
        borderColor="border/regular"
        background="background/primary"
      >
        <RailButton
          icon={IconTerminal}
          label="CI blocks"
          isSelected={!currentTool && visibleView === 'building-blocks'}
          onSelect={() => showList('building-blocks')}
        />
        {isModular && (
          <RailButton
            icon={IconFolder}
            label="Modules"
            isSelected={!currentTool && visibleView === 'files'}
            onSelect={() => showList('files')}
          />
        )}
        <Separator width="24" marginBlock="4" />
        {TOOLS.filter((tool) => !tool.isWebsiteOnly || RuntimeUtils.isWebsiteMode()).map((tool) => (
          <Box key={tool.page} data-intercom-target={tool.intercomTarget}>
            <RailButton
              icon={tool.icon}
              label={tool.label}
              isSelected={currentTool?.page === tool.page}
              onSelect={() => openTool(tool.path)}
            />
          </Box>
        ))}
        <Box marginBlockStart="auto" display="flex" flexDirection="column" gap="4">
          <BitkitControlButton
            data-intercom-target="YAML Reference Navigation Item"
            href="https://docs.bitrise.io/en/bitrise-ci/references/configuration-yaml-reference.html"
            isExternal
            icon={IconBook}
            label="YAML Reference"
            tooltipProps={{ placement: 'right' }}
            onClick={() => segmentTrack('Workflow Editor YAML Reference Button Clicked')}
          />
          <BitkitControlButton
            data-intercom-target="Workflow Recipes Navigation Item"
            href="https://github.com/bitrise-io/workflow-recipes"
            isExternal
            icon={IconDoc}
            label="Workflow Recipes"
            tooltipProps={{ placement: 'right' }}
            onClick={() => segmentTrack('Workflow Editor Workflow Recipes Button Clicked')}
          />
        </Box>
      </Box>

      {/* The list beside the rail; a tool panel takes its place while open. */}
      {!currentTool && (
        <BitkitPageSidebar
          flexShrink={0}
          // The layout gives the sidebar the height of the row under the header, so the component's own
          // `100dvh` floor has to give way or it pushes past the bottom of the editor.
          minHeight="auto"
          // Wide enough for entity names; Bitkit caps the sidebar at 320 from tablet up, so the cap is
          // lifted with it.
          width={rem(340)}
          maxWidth={rem(340)}
          paddingBlockStart="8"
          paddingInline="8"
        >
          {/* Bitkit's body fills the sidebar but never scrolls, so a long list would push the whole editor
              page down. The body is held to the sidebar's height and the list scrolls inside it. */}
          <BitkitPageSidebar.Body minHeight="0">
            <Box flex="1" minHeight="0" overflowY="auto">
              {visibleView === 'files' && <FilesPanel />}
              {visibleView === 'building-blocks' && (
                <BuildingBlocks query={buildingBlocksQuery} onQueryChange={setBuildingBlocksQuery} />
              )}
            </Box>
          </BitkitPageSidebar.Body>
        </BitkitPageSidebar>
      )}
    </Box>
  );
};

export default Navigation;
