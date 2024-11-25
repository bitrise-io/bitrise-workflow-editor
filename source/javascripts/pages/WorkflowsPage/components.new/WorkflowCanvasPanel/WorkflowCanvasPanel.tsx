import { useEffect, useMemo, useState } from 'react';
import { Box, IconButton } from '@bitrise/bitkit';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WorkflowService from '@/core/models/WorkflowService';
import { StepActions } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { LibraryType } from '@/core/models/Step';
import { useWorkflowsPageStore } from '../../WorkflowsPage.store';
import WorkflowSelector from './components/WorkflowSelector/WorkflowSelector';

type Props = {
  workflowId: string;
};

const WorkflowCanvasPanel = ({ workflowId }: Props) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const { moveStep, upgradeStep, cloneStep, deleteStep, setChainedWorkflows, removeChainedWorkflow } =
    useBitriseYmlStore((s) => ({
      moveStep: s.moveStep,
      setChainedWorkflows: s.setChainedWorkflows,
      removeChainedWorkflow: s.removeChainedWorkflow,
      upgradeStep: s.changeStepVersion,
      cloneStep: s.cloneStep,
      deleteStep: s.deleteStep,
    }));

  const {
    openStepConfigDrawer,
    openWithGroupConfigDrawer,
    openStepBundleDrawer,
    openStepSelectorDrawer,
    openRunWorkflowDialog,
    openChainWorkflowDialog,
    openWorkflowConfigDrawer,
  } = useWorkflowsPageStore();

  useEffect(() => {
    const listener = (event: CustomEvent<boolean>) => {
      setHasUnsavedChanges(event.detail);
    };

    window.addEventListener('main::yml::has-unsaved-changes' as never, listener);

    return () => window.removeEventListener('main::yml::has-unsaved-changes' as never, listener);
  }, []);

  const runButtonAriaLabel = useMemo(() => {
    if (WorkflowService.isUtilityWorkflow(workflowId)) {
      return "Utility workflows can't be run";
    }

    if (hasUnsavedChanges) {
      return 'Save changes before running';
    }

    return 'Run Workflow';
  }, [hasUnsavedChanges, workflowId]);

  const openStepLikeDrawer: StepActions['onSelectStep'] = (wfId, stepIndex, libraryType) => {
    switch (libraryType) {
      case LibraryType.WITH:
        openWithGroupConfigDrawer(wfId, stepIndex);
        break;
      case LibraryType.BUNDLE:
        openStepBundleDrawer(wfId, stepIndex);
        break;
      default:
        openStepConfigDrawer(wfId, stepIndex);
        break;
    }
  };

  return (
    <Box h="100%" display="flex" flexDir="column" minW={[256, 320, 400]}>
      <Box p="12" display="flex" gap="12" bg="background/primary" borderBottom="1px solid" borderColor="border/regular">
        <WorkflowSelector />
        {RuntimeUtils.isWebsiteMode() && (
          <IconButton
            size="md"
            iconName="Play"
            variant="secondary"
            aria-label={runButtonAriaLabel}
            tooltipProps={{
              'aria-label': runButtonAriaLabel,
            }}
            isDisabled={WorkflowService.isUtilityWorkflow(workflowId) || hasUnsavedChanges}
            onClick={() => openRunWorkflowDialog(workflowId)}
          />
        )}
      </Box>
      <Box flex="1" overflowY="auto" p="16" bg="background/secondary">
        <WorkflowCard
          id={workflowId}
          containerProps={{ maxW: 400, marginX: 'auto' }}
          // Workflow actions
          onEditWorkflow={undefined}
          onEditChainedWorkflow={openWorkflowConfigDrawer}
          onChainWorkflow={openChainWorkflowDialog}
          onChainChainedWorkflow={openChainWorkflowDialog}
          onRemoveWorkflow={undefined}
          onRemoveChainedWorkflow={removeChainedWorkflow}
          onChainedWorkflowsUpdate={setChainedWorkflows}
          // Step actions
          onAddStep={openStepSelectorDrawer}
          onSelectStep={openStepLikeDrawer}
          onMoveStep={moveStep}
          onUpgradeStep={upgradeStep}
          onCloneStep={cloneStep}
          onDeleteStep={deleteStep}
        />
      </Box>
    </Box>
  );
};

export default WorkflowCanvasPanel;
