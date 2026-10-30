import {
  BitkitIconComponent,
  BitkitPageSidebar,
  BitkitPageSidebarProps,
  createBitkitToast,
  IconArrowNortheast,
  IconBook,
  IconContainer,
  IconDoc,
  IconDollar,
  IconKey,
  IconLock,
  IconStack,
  IconStep,
  IconTrigger,
  IconWorkflow,
  IconWorkflowFlow,
  rem,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { useCallback, useEffect, useRef, useState } from 'react';

import FileTreeViewer from '@/components/FileTreeViewer/FileTreeViewer';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { bitriseYmlStore, getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';
import { useCiConfigExpertStore } from '@/core/stores/CiConfigExpertStore';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WindowUtils from '@/core/utils/WindowUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useCurrentPage from '@/hooks/useCurrentPage';
import useHashLocation from '@/hooks/useHashLocation';
import useParentMessageListener from '@/hooks/useParentMessageListener';
import useSearchParams from '@/hooks/useSearchParams';
import useVisualEditorNotice from '@/hooks/useVisualEditorNotice';
import { paths } from '@/routes';

type Props = Omit<BitkitPageSidebarProps, 'children'> & {
  /** Collapses the page navigation so only the module file tree is left (YAML view of a modular config). */
  hidePageNav?: boolean;
};
type NavigationItemProps = {
  children: string;
  path: string;
  icon: BitkitIconComponent;
  intercomTarget?: string;
};

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

// Whether the element has content scrolled out of view below its bottom edge.
const useHasMoreBelow = () => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  useEffect(() => {
    if (!element) {
      return undefined;
    }
    const update = () => setHasMoreBelow(element.scrollTop + element.clientHeight < element.scrollHeight - 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, [element]);

  return [setElement, hasMoreBelow] as const;
};

const Navigation = ({ hidePageNav = false, ...props }: Props) => {
  const currentPage = useCurrentPage();
  const isDefaultTabRef = useRef(true);
  const [navBodyRef, hasMoreNavBelow] = useHasMoreBelow();
  // Whether the page navigation may show its scrollbar. Off for the whole collapse / expand, so the
  // scrollbar doesn't flash in and shrink with the panel: it goes the moment the nav starts to
  // collapse, and comes back only once it has fully expanded again (transitionend below).
  const [isNavScrollable, setIsNavScrollable] = useState(!hidePageNav);
  if (hidePageNav && isNavScrollable) {
    setIsNavScrollable(false);
  }
  // Fallback for when transitionend never fires (e.g. the page was in the background during the switch).
  // Generous on purpose: rendering the visual page can hold the expand back by a few hundred ms.
  useEffect(() => {
    if (hidePageNav || isNavScrollable) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setIsNavScrollable(true), 1000);
    return () => window.clearTimeout(timeout);
  }, [hidePageNav, isNavScrollable]);
  const { data } = useCiConfigSettings();
  const withSearchParams = usePathWithSearchParams();
  const yamlSelector = currentPage === 'workflows' || currentPage === 'pipelines' ? currentPage : undefined;

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

  return (
    // Every label, icon and link in the sidebar is the same for every user and account.
    <BitkitPageSidebar
      data-clarity-unmask="true"
      flexShrink={0}
      // The layout gives the sidebar the height of the row under the header, so the component's own
      // `100dvh` floor has to give way or it pushes past the bottom of the editor.
      minHeight="auto"
      // The width v1 had. There is no narrow icon-only mode in the design system, so the mobile rail
      // went with the migration.
      width={rem(256)}
      // The navigation and the file tree each scroll inside their own area, so the sidebar itself
      // must not grow or scroll.
      overflow="hidden"
      // Without the nav, the title's own top padding is enough; the sidebar's would double the gap.
      paddingBlockStart={hidePageNav ? '0' : undefined}
      transition="padding-block-start 200ms ease-out"
      _motionReduce={{ transition: 'none' }}
      {...props}
    >
      {/* Page navigation, at its natural height. It only scrolls if the window is too short for it.
          In the YAML view of a modular config it collapses away (0fr ↔ 1fr row, animated), so the
          module tree slides up rather than jumping when the view changes. */}
      <Box
        flex="0 1 auto"
        minHeight={0}
        display="grid"
        gridTemplateRows={hidePageNav ? '0fr' : '1fr'}
        // visibility interpolates, so the nav stays visible while it closes, then leaves the tab order.
        visibility={hidePageNav ? 'hidden' : 'visible'}
        transition="grid-template-rows 200ms ease-out, visibility 200ms"
        _motionReduce={{ transition: 'none' }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === 'grid-template-rows' && !hidePageNav) {
            setIsNavScrollable(true);
          }
        }}
      >
        {/* The grid row can only close to 0 if its child clips: the Body's own padding would hold it open. */}
        <Box minHeight={0} overflow="hidden" display="flex" flexDirection="column">
          <BitkitPageSidebar.Body
            ref={navBodyRef}
            minHeight={0}
            overflowY={isNavScrollable ? 'auto' : 'hidden'}
            // On short windows the module tree keeps its minimum height and the nav scrolls; the fade shows
            // the list goes on below the last visible item.
            maskImage={hasMoreNavBelow ? 'linear-gradient(to bottom, black calc(100% - 2rem), transparent)' : undefined}
          >
            <NavigationItem
              path={withSearchParams(paths.workflows)}
              icon={IconWorkflow}
              intercomTarget="Workflows Page Navigation Item"
            >
              Workflows
            </NavigationItem>
            <NavigationItem
              path={withSearchParams(paths.pipelines)}
              icon={IconWorkflowFlow}
              intercomTarget="Pipelines Page Navigation Item"
            >
              Pipelines
            </NavigationItem>
            <NavigationItem
              path={withSearchParams(paths.stepBundles)}
              icon={IconStep}
              intercomTarget="Step Bundles Page Navigation Item"
            >
              Step bundles
            </NavigationItem>
            <NavigationItem
              path={withSearchParams(paths.secrets)}
              icon={IconLock}
              intercomTarget="Secrets Page Navigation Item"
            >
              Secrets
            </NavigationItem>
            <NavigationItem
              path={withSearchParams(paths.envVars)}
              icon={IconDollar}
              intercomTarget="Env Vars Page Navigation Item"
            >
              Env Vars
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
          </BitkitPageSidebar.Body>
        </Box>
      </Box>
      {/* Modular configs only: the module file tree, filling the space between the navigation and
          the footer. */}
      <FileTreeViewer showDivider={!hidePageNav} />
      {/* Pushed to the bottom when there's no file tree to fill the space above it. */}
      <BitkitPageSidebar.Footer marginBlockStart="auto">
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
