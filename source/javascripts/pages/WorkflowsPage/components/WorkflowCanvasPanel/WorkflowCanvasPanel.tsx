import { useEffect, useMemo, useState } from 'react';
import { Box, CardProps, IconButton } from '@bitrise/bitkit';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WorkflowService from '@/core/models/WorkflowService';
import { StepActions } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import { LibraryType } from '@/core/models/Step';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '../../WorkflowsPage.store';
import WorkflowSelector from '../WorkflowSelector/WorkflowSelector';

type Props = {
  workflowId: string;
};

const containerProps: CardProps = {
  maxW: 400,
  marginX: 'auto',
};

const WorkflowCanvasPanel = ({ workflowId }: Props) => {
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const { moveStep, cloneStep, deleteStep, upgradeStep, setChainedWorkflows, removeChainedWorkflow } =
    useBitriseYmlStore((s) => ({
      moveStep: s.moveStep,
      cloneStep: s.cloneStep,
      deleteStep: s.deleteStep,
      upgradeStep: s.changeStepVersion,
      setChainedWorkflows: s.setChainedWorkflows,
      removeChainedWorkflow: s.removeChainedWorkflow,
    }));

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
        openDialog(WorkflowsPageDialogType.WITH_GROUP, wfId, stepIndex)();
        break;
      case LibraryType.BUNDLE:
        openDialog(WorkflowsPageDialogType.STEP_BUNDLE, wfId, stepIndex)();
        break;
      default:
        openDialog(WorkflowsPageDialogType.STEP_CONFIG, wfId, stepIndex)();
        break;
    }
  };

  const openRunWorkflowDialog = (wfId: string) => {
    openDialog(WorkflowsPageDialogType.START_BUILD, wfId)();
  };

  const openWorkflowConfigDrawer = (wfId: string) => {
    openDialog(WorkflowsPageDialogType.WORKFLOW_CONFIG, wfId)();
  };

  const openChainWorkflowDialog = (wfId: string) => {
    openDialog(WorkflowsPageDialogType.CHAIN_WORKFLOW, wfId)();
  };

  const openStepSelectorDrawer = (wfId: string, stepIndex: number) => {
    openDialog(WorkflowsPageDialogType.STEP_SELECTOR, wfId, stepIndex)();
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
          containerProps={containerProps}
          // Workflow actions
          onEditWorkflow={undefined}
          onRemoveWorkflow={undefined}
          onChainWorkflow={openChainWorkflowDialog}
          onChainedWorkflowsUpdate={setChainedWorkflows}
          onRemoveChainedWorkflow={removeChainedWorkflow}
          onEditChainedWorkflow={openWorkflowConfigDrawer}
          onChainChainedWorkflow={openChainWorkflowDialog}
          // Step actions
          onMoveStep={moveStep}
          onCloneStep={cloneStep}
          onDeleteStep={deleteStep}
          onUpgradeStep={upgradeStep}
          onSelectStep={openStepLikeDrawer}
          onAddStep={openStepSelectorDrawer}
        />
      </Box>
    </Box>
  );
};

export default WorkflowCanvasPanel;
