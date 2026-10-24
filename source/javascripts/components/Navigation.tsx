import {
  BitkitIconComponent,
  BitkitPageSidebar,
  BitkitPageSidebarProps,
  BitkitSegmentedControl,
  createBitkitToast,
  IconArrowNortheast,
  IconBook,
  IconContainer,
  IconDoc,
  IconDollar,
  IconKey,
  IconLock,
  IconStack,
  IconTrigger,
  rem,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { useCallback, useEffect, useRef, useState } from 'react';

import BuildingBlocks from '@/components/Navigation/BuildingBlocks';
import FilesPanel from '@/components/Navigation/FilesPanel';
import FirstBuildingBlock from '@/components/Navigation/firstBuildingBlock';
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
import { paths } from '@/routes';

type Props = Omit<BitkitPageSidebarProps, 'children'>;
type NavigationItemProps = {
  children: string;
  path: string;
  icon: BitkitIconComponent;
  intercomTarget?: string;
};

type SidebarView = 'files' | 'building-blocks' | 'tools';

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

const NavigationItem = ({ children, path, icon, intercomTarget }: NavigationItemProps) => {
  const [hashPath, navigate] = useHashLocation();
  const isSelected = hashPath.startsWith(path);
  // Schema/marker errors don't block navigation: the visual pages render any config they can read.
  // Blocking on the broader validation status trapped users on the current page whenever the YAML
  // was merely schema-invalid (SSW-3087).
  const visualEditorNotice = useVisualEditorNotice();

  const handleNavigation = useCallback(() => {
    if (visualEditorNotice?.disabled && !path.startsWith(paths.yml)) {
      createBitkitToast({
        variant: visualEditorNotice.severity,
        titleText: visualEditorNotice.title,
        messageText: visualEditorNotice.description,
      });
      return;
    }

    navigate(path);
  }, [visualEditorNotice, navigate, path]);

  return (
    <BitkitPageSidebar.Item
      data-intercom-target={intercomTarget}
      icon={icon}
      onClick={handleNavigation}
      selected={isSelected}
    >
      {children}
    </BitkitPageSidebar.Item>
  );
};

const Tools = () => {
  const withSearchParams = usePathWithSearchParams();

  return (
    <>
      <NavigationItem
        path={withSearchParams(paths.envVars)}
        icon={IconDollar}
        intercomTarget="Env Vars Page Navigation Item"
      >
        Env Vars
      </NavigationItem>
      <NavigationItem
        path={withSearchParams(paths.secrets)}
        icon={IconLock}
        intercomTarget="Secrets Page Navigation Item"
      >
        Secrets
      </NavigationItem>
      <NavigationItem
        path={withSearchParams(paths.triggers)}
        icon={IconTrigger}
        intercomTarget="Triggers Page Navigation Item"
      >
        Triggers
      </NavigationItem>
      <NavigationItem
        path={withSearchParams(paths.containers)}
        icon={IconContainer}
        intercomTarget="Containers Page Navigation Item"
      >
        Containers
      </NavigationItem>
      {RuntimeUtils.isWebsiteMode() && (
        <NavigationItem
          path={withSearchParams(paths.stacksAndMachines)}
          icon={IconStack}
          intercomTarget="Stacks & Machines Page Navigation Item"
        >
          Stacks & Machines
        </NavigationItem>
      )}
      {RuntimeUtils.isWebsiteMode() && (
        <NavigationItem
          path={withSearchParams(paths.licenses)}
          icon={IconKey}
          intercomTarget="Licenses Page Navigation Item"
        >
          Licenses
        </NavigationItem>
      )}
    </>
  );
};

const Navigation = (props: Props) => {
  const currentPage = useCurrentPage();
  const isDefaultTabRef = useRef(true);
  const { data } = useCiConfigSettings();
  const yamlSelector = currentPage === 'workflows' || currentPage === 'pipelines' ? currentPage : undefined;
  // Opens on the menu that holds the page you land on; after that it's the user's choice.
  const [, navigate] = useHashLocation();
  const [searchParams] = useSearchParams();
  const withSearchParams = usePathWithSearchParams();
  const visualEditorNotice = useVisualEditorNotice();
  const [view, setView] = useState<SidebarView>(() =>
    BUILDING_BLOCK_PAGES.includes(currentPage ?? '') ? 'building-blocks' : 'tools',
  );
  // A single-file config has nothing to navigate between, so it gets no Files menu.
  const tree = useTree();
  const isModular = Boolean(tree && tree.includes.length > 0);
  const visibleView = view === 'files' && !isModular ? 'building-blocks' : view;
  // Held here so a search survives switching to another menu and back.
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

  // Picking Tools from a Pipeline, Workflow or Step bundle page opens its first tool, Env Vars, so the
  // menu and the page agree. On a tool page already, the page stays.
  // Opens the open file's first CI block, replacing whatever entity the URL picked.
  const openFirstBuildingBlock = () => {
    const target = FirstBuildingBlock.firstBuildingBlock(bitriseYmlStore.getState().yml);
    if (!target || visualEditorNotice?.disabled) {
      return;
    }
    const params = new URLSearchParams(searchParams);
    FirstBuildingBlock.entityParams.forEach((param) => params.delete(param));
    params.set(target.param, target.id);
    navigate(`${target.path}?${params.toString()}`);
  };

  // Switching file tabs shows that file's CI blocks wherever the canvas would otherwise not change: from a
  // tool page (Env Vars, Secrets, …), or from a kind the new file doesn't have (e.g. only Step bundles while
  // on Pipelines). The sidebar switches to CI blocks to match, from Tools and from Files alike: picking a
  // file shows what's in it, and Files is one click away. The YAML page stays put. Only on switching
  // files: deleting the last entity of a kind keeps you there.
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
    if (page !== 'yml' && (!isBlockPage || !FirstBuildingBlock.hasBlocksFor(bitriseYmlStore.getState().yml, page))) {
      openFirstBuildingBlock();
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
      openFirstBuildingBlock();
    }
    // Runs once, when the config first has a block; the rest is read fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnyBlock]);

  const handleViewChange = (next: SidebarView) => {
    setView(next);
    // CI blocks opens on the highest-level block: the first Pipeline, else Workflow, else Step bundle.
    // On the YAML page it stays put: there, CI blocks jump within the YAML instead.
    if (next === 'building-blocks' && currentPage !== 'yml') {
      openFirstBuildingBlock();
    }
    if (next === 'tools' && BUILDING_BLOCK_PAGES.includes(currentPage ?? '') && !visualEditorNotice?.disabled) {
      navigate(withSearchParams(paths.envVars));
    }
  };
  return (
    // The sidebar's own labels, icons and links are the same for every user and account; the entity
    // lists and file tree inside it mask themselves.
    <BitkitPageSidebar
      data-clarity-unmask="true"
      flexShrink={0}
      // The layout gives the sidebar the height of the row under the header, so the component's own
      // `100dvh` floor has to give way or it pushes past the bottom of the editor.
      minHeight="auto"
      // Wide enough for the segmented control's labels on one line and entity names with their
      // subtext. Bitkit caps the sidebar at 320 from tablet up, so the cap is lifted with it.
      width={rem(340)}
      maxWidth={rem(340)}
      // Even space above and below the segmented control (the sidebar's own top padding is 16).
      paddingBlockStart="8"
      // 8px on both sides, for the body and the footer alike (Bitkit gives the sidebar none).
      paddingInline="8"
      {...props}
    >
      {/* Bitkit's body fills the sidebar but never scrolls, so a long list pushed the whole editor page
          down. The body is held to the sidebar's height; the switch stays put and the panel below it
          scrolls, between the switch and the footer. */}
      <BitkitPageSidebar.Body minHeight="0">
        <BitkitSegmentedControl
          fullWidth
          // Design-system deviation: fullWidth gives every option an equal share (`flex: 1`), which
          // wrapped the longer labels. Growing each from its label's width keeps the control full width
          // without wrapping.
          css={{ '& [data-part="item"]': { flex: '1 1 auto' } }}
          size="sm"
          value={visibleView}
          onValueChange={(details) => details.value && handleViewChange(details.value as SidebarView)}
          marginBlockEnd="8"
          flexShrink={0}
        >
          {isModular && <BitkitSegmentedControl.Item value="files">Modules</BitkitSegmentedControl.Item>}
          <BitkitSegmentedControl.Item value="building-blocks">CI blocks</BitkitSegmentedControl.Item>
          <BitkitSegmentedControl.Item value="tools">Tools</BitkitSegmentedControl.Item>
        </BitkitSegmentedControl>
        <Box flex="1" minHeight="0" overflowY="auto">
          {visibleView === 'files' && <FilesPanel />}
          {visibleView === 'building-blocks' && (
            <BuildingBlocks query={buildingBlocksQuery} onQueryChange={setBuildingBlocksQuery} />
          )}
          {visibleView === 'tools' && <Tools />}
        </Box>
      </BitkitPageSidebar.Body>
      <BitkitPageSidebar.Footer>
        <BitkitPageSidebar.Item
          data-intercom-target="YAML Reference Navigation Item"
          href="https://docs.bitrise.io/en/bitrise-ci/references/configuration-yaml-reference.html"
          icon={IconBook}
          onClick={() => segmentTrack('Workflow Editor YAML Reference Button Clicked')}
          rel="noopener noreferrer"
          suffixIcon={IconArrowNortheast}
          target="_blank"
        >
          YAML Reference
        </BitkitPageSidebar.Item>
        <BitkitPageSidebar.Item
          data-intercom-target="Workflow Recipes Navigation Item"
          href="https://github.com/bitrise-io/workflow-recipes"
          icon={IconDoc}
          onClick={() => segmentTrack('Workflow Editor Workflow Recipes Button Clicked')}
          rel="noopener noreferrer"
          suffixIcon={IconArrowNortheast}
          target="_blank"
        >
          Workflow Recipes
        </BitkitPageSidebar.Item>
      </BitkitPageSidebar.Footer>
    </BitkitPageSidebar>
  );
};

export default Navigation;
