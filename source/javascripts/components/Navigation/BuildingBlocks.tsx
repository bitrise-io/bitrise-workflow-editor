import {
  BitkitButton,
  BitkitSearchInput,
  createBitkitToast,
  IconStep,
  IconWorkflow,
  IconWorkflowFlow,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useCallback, useMemo, useState } from 'react';

import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useCurrentPage from '@/hooks/useCurrentPage';
import { useFileTabs } from '@/hooks/useFileTabs';
import useHashLocation from '@/hooks/useHashLocation';
import usePipelines from '@/hooks/usePipelines';
import useSearchParams, { getSearchParamsFromLocationHash } from '@/hooks/useSearchParams';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useIsMergedConfigSelected, useTree } from '@/hooks/useTree';
import useVisualEditorNotice from '@/hooks/useVisualEditorNotice';
import { useWorkflows } from '@/hooks/useWorkflows';
import { PipelinesPageDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '@/pages/WorkflowsPage/WorkflowsPage.store';
import YmlEditorRegistry, { YmlSection } from '@/pages/YmlPage/ymlEditorRegistry';
import { paths } from '@/routes';

import AddControl from './AddControl';
import EntitySection, { EntityItem } from './EntitySection';
import useEntityStatuses from './useEntityStatuses';

const ENTITY_PARAMS = ['workflow_id', 'pipeline', 'step_bundle_id'];

// Opens a page with one entity selected, keeping the other params (e.g. the branch) and dropping
// the previous page's selection.
const useOpenEntity = () => {
  const [, navigate] = useHashLocation();
  const [searchParams] = useSearchParams();
  const visualEditorNotice = useVisualEditorNotice();

  return useCallback(
    (path: string, entity?: { param: string; id: string }) => {
      if (visualEditorNotice?.disabled) {
        createBitkitToast({
          variant: visualEditorNotice.severity,
          titleText: visualEditorNotice.title,
          messageText: visualEditorNotice.description,
        });
        return false;
      }
      const params = new URLSearchParams(searchParams);
      ENTITY_PARAMS.forEach((param) => params.delete(param));
      if (entity) params.set(entity.param, entity.id);
      const query = params.toString();
      navigate(query ? `${path}?${query}` : path);
      return true;
    },
    [navigate, searchParams, visualEditorNotice],
  );
};

// The lists show the open file's entities, as the pages do, so say which file that is.
const ActiveFileNotice = () => {
  const tree = useTree();
  const isMergedConfigSelected = useIsMergedConfigSelected();
  const activePath = useBitriseYmlStore((s) => (s.selectedNodeId ? s.files[s.selectedNodeId]?.path : undefined));
  const { selectMergedConfig } = useFileTabs();

  if (!tree || isMergedConfigSelected || !activePath) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" gap="4" paddingInline="8">
      <Text textStyle="body/sm/regular" color="text/secondary" flex="1" minWidth="0" truncate>
        Showing{' '}
        <Text as="span" textStyle="body/sm/semibold" data-clarity-mask="true">
          {activePath}
        </Text>
      </Text>
      <BitkitButton size="sm" variant="tertiary" onClick={selectMergedConfig}>
        Show all
      </BitkitButton>
    </Box>
  );
};

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
};

const BuildingBlocks = ({ query, onQueryChange }: Props) => {
  const currentPage = useCurrentPage();
  // Re-render on hash changes; the selection itself is read from the live hash, as the pages do.
  useHashLocation();
  const openEntity = useOpenEntity();

  const pipelines = usePipelines();
  const workflowIds = useWorkflows((s) => Object.keys(s));
  const stepBundleIds = useStepBundles((s) => Object.keys(s));

  const search = query.trim().toLowerCase();
  const isSearching = search.length > 0;
  const matching = useCallback(
    (items: EntityItem[]) =>
      items.filter(({ id, label }) => id.toLowerCase().includes(search) || label.toLowerCase().includes(search)),
    [search],
  );

  // Pipelines go by their title where they have one, as the Pipelines page names them.
  const statuses = useEntityStatuses();
  const pipelineItems = matching(
    Object.entries(pipelines).map(([id, pipeline]) => ({
      id,
      label: pipeline?.title || id,
      status: statuses.pipeline(id),
    })),
  );
  // Runnable Workflows first, utility ones (`_` prefix) after them, as the old selector grouped them.
  const workflowItems = matching(
    useMemo(
      () =>
        [
          ...workflowIds.filter((id) => !WorkflowService.isUtilityWorkflow(id)),
          ...workflowIds.filter((id) => WorkflowService.isUtilityWorkflow(id)),
        ].map((id) => ({ id, label: id, status: statuses.workflow(id) })),
      [workflowIds, statuses],
    ),
  );
  const stepBundleItems = matching(stepBundleIds.map((id) => ({ id, label: id, status: statuses.stepBundle(id) })));

  const hashParams = getSearchParamsFromLocationHash();
  // On the YAML page, a click jumps the editor to the definition (the lists show what the YAML on screen
  // holds, so it's always there), and the row it jumped to stays selected. The page names double as
  // the YAML sections' keys.
  const [revealed, setRevealed] = useState<{ section: YmlSection; id: string }>();
  const revealInYaml = (section: YmlSection, id: string) => {
    if (currentPage !== 'yml') {
      return false;
    }
    setRevealed({ section, id });
    YmlEditorRegistry.revealYmlDefinition(section, id);
    return true;
  };
  const selected = (page: YmlSection, param: string) => {
    if (currentPage === 'yml') {
      return revealed?.section === page ? revealed.id : undefined;
    }
    return currentPage === page ? hashParams[param] : undefined;
  };
  // Whether the page being left has a drawer open: then the clicked entity's settings drawer takes its place.
  const isDrawerOpenOnCurrentPage = () => {
    switch (currentPage) {
      case 'pipelines':
        return usePipelinesPageStore.getState().openedDialogType !== PipelinesPageDialogType.NONE;
      case 'workflows':
        return useWorkflowsPageStore.getState().openedDialogType !== WorkflowsPageDialogType.NONE;
      case 'step_bundles':
        return useStepBundlesPageStore.getState().openedDialogType !== StepBundlesPageDialogType.NONE;
      default:
        return false;
    }
  };
  const createIn = (path: string, openDialog: () => void) => () => {
    if (openEntity(path)) openDialog();
  };

  // How each kind is created; a section's header + and its empty state share it.
  const createPipeline = {
    entityName: 'Pipeline' as const,
    ai: { action: 'create_pipeline', source: 'pipeline_selector', yamlSelector: 'pipelines' },
    onCreate: createIn(paths.pipelines, () =>
      usePipelinesPageStore.getState().openDialog({ type: PipelinesPageDialogType.CREATE_PIPELINE })(),
    ),
  };
  const createWorkflow = {
    entityName: 'Workflow' as const,
    ai: { action: 'create_workflow', source: 'workflow_selector', yamlSelector: 'workflows' },
    onCreate: createIn(paths.workflows, () =>
      useWorkflowsPageStore.getState().openDialog({ type: WorkflowsPageDialogType.CREATE_WORKFLOW })(),
    ),
  };
  const createStepBundle = {
    entityName: 'Step bundle' as const,
    onCreate: createIn(paths.stepBundles, () =>
      useStepBundlesPageStore.getState().openDialog({ type: StepBundlesPageDialogType.CREATE_STEP_BUNDLE })(),
    ),
  };

  const sections = [
    {
      label: 'Pipelines',
      items: pipelineItems,
      selectedId: selected('pipelines', 'pipeline'),
      // Workflows and Step bundles open their settings drawer on selection (their pages do that); a
      // Pipeline does when it replaces an open drawer.
      onSelect: (id: string) => {
        if (revealInYaml('pipelines', id)) {
          return;
        }
        const hadDrawer = isDrawerOpenOnCurrentPage();
        if (openEntity(paths.pipelines, { param: 'pipeline', id }) && hadDrawer) {
          usePipelinesPageStore
            .getState()
            .openDialog({ type: PipelinesPageDialogType.PIPELINE_CONFIG, pipelineId: id })();
        }
      },
      addControl: <AddControl {...createPipeline} />,
      empty: {
        icon: IconWorkflowFlow,
        heading: 'No Pipelines yet',
        body: 'Run several Workflows together, one after another or in parallel.',
        action: <AddControl {...createPipeline} variant="button" />,
      },
    },
    {
      label: 'Workflows',
      items: workflowItems,
      selectedId: selected('workflows', 'workflow_id'),
      onSelect: (id: string) =>
        revealInYaml('workflows', id) || openEntity(paths.workflows, { param: 'workflow_id', id }),
      addControl: <AddControl {...createWorkflow} />,
      empty: {
        icon: IconWorkflow,
        heading: 'No Workflows yet',
        body: 'A Workflow is the series of Steps a build runs.',
        action: <AddControl {...createWorkflow} variant="button" />,
      },
    },
    {
      label: 'Step bundles',
      items: stepBundleItems,
      selectedId: selected('step_bundles', 'step_bundle_id'),
      onSelect: (id: string) =>
        revealInYaml('step_bundles', id) || openEntity(paths.stepBundles, { param: 'step_bundle_id', id }),
      addControl: <AddControl {...createStepBundle} />,
      empty: {
        icon: IconStep,
        heading: 'No Step bundles yet',
        body: 'With Step bundles, you can create reusable chunks of configuration.',
        action: <AddControl {...createStepBundle} variant="button" />,
      },
    },
  ];
  // While searching, only sections with a match are shown, and nothing at all gets one message.
  const visibleSections = isSearching ? sections.filter((section) => section.items.length > 0) : sections;

  return (
    <Box display="flex" flexDirection="column" gap="12">
      <BitkitSearchInput
        data-clarity-mask="true"
        placeholder="Search..."
        size="md"
        value={query}
        onChange={onQueryChange}
      />
      <ActiveFileNotice />
      {visibleSections.length > 0 ? (
        <Box display="flex" flexDirection="column" gap="8">
          {visibleSections.map((section) => (
            <EntitySection key={section.label} {...section} isSearching={isSearching} />
          ))}
        </Box>
      ) : (
        <Text textStyle="body/md/regular" color="text/secondary" paddingInline="8" data-clarity-mask="true">
          No Pipelines, Workflows or Step bundles match “{query.trim()}”.
        </Text>
      )}
    </Box>
  );
};

export default BuildingBlocks;
