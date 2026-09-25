import { useToast } from '@bitrise/bitkit';
import {
  BitkitIconComponent,
  BitkitPageSidebar,
  BitkitPageSidebarProps,
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
import { useCallback, useEffect, useRef } from 'react';

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
import useVisualEditorBlocker, { VISUAL_EDITOR_BLOCKERS } from '@/hooks/useVisualEditorBlocker';
import { paths } from '@/routes';

type Props = Omit<BitkitPageSidebarProps, 'children'>;
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
  const toast = useToast();
  const [hashPath, navigate] = useHashLocation();
  const isSelected = hashPath.startsWith(path);
  // Schema/marker errors don't block navigation: the visual pages render any config that parses.
  // Blocking on the broader validation status trapped users on the current page whenever the YAML
  // was merely schema-invalid (SSW-3087).
  const visualEditorBlocker = useVisualEditorBlocker();

  const handleNavigation = useCallback(() => {
    if (visualEditorBlocker && !path.startsWith(paths.yml)) {
      toast({
        status: 'error',
        title: VISUAL_EDITOR_BLOCKERS[visualEditorBlocker].title,
        description: VISUAL_EDITOR_BLOCKERS[visualEditorBlocker].message,
        duration: null,
        isClosable: true,
      });
      return;
    }

    navigate(path);
  }, [visualEditorBlocker, navigate, path, toast]);

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

const Navigation = (props: Props) => {
  const currentPage = useCurrentPage();
  const isDefaultTabRef = useRef(true);
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
      {...props}
    >
      <BitkitPageSidebar.Body>
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
