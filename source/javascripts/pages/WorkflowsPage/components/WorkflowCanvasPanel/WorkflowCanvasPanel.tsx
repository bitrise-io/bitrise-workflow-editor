import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Box, CardProps, IconButton } from '@bitrise/bitkit';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WorkflowService from '@/core/models/WorkflowService';
import { LibraryType } from '@/core/models/Step';
import { ChainedWorkflowPlacement } from '@/core/models/Workflow';
import { useWorkflows } from '@/hooks/useWorkflows';
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
  const workflows = useWorkflows();
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  const selectedWorkflowId = useWorkflowsPageStore((s) => s.workflowId);
  const selectedStepIndex = useWorkflowsPageStore((s) => s.stepIndex);
  const setStepIndex = useWorkflowsPageStore((s) => s.setStepIndex);
  const closeDialog = useWorkflowsPageStore((s) => s.closeDialog);
  const deferredStepIndex = useDeferredValue(selectedStepIndex);
  const deferredWorkflowId = useDeferredValue(selectedWorkflowId);

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

  const openStepLikeDrawer = useCallback(
    (wfId: string, stepIndex: number, libraryType: LibraryType) => {
      switch (libraryType) {
        case LibraryType.WITH:
          openDialog({
            type: WorkflowsPageDialogType.WITH_GROUP,
            workflowId: wfId,
            stepIndex,
          })();
          break;
        case LibraryType.BUNDLE:
          openDialog({
            type: WorkflowsPageDialogType.STEP_BUNDLE,
            workflowId: wfId,
            stepIndex,
          })();
          break;
        default:
          openDialog({
            type: WorkflowsPageDialogType.STEP_CONFIG,
            workflowId: wfId,
            stepIndex,
          })();
          break;
      }
    },
    [openDialog],
  );

  const openRunWorkflowDialog = useCallback(
    (wfId: string) => {
      openDialog({
        type: WorkflowsPageDialogType.START_BUILD,
        workflowId: wfId,
      })();
    },
    [openDialog],
  );

  const openWorkflowConfigDrawer = useCallback(
    (wfId: string, parentWorkflowId?: string) => {
      openDialog({
        type: WorkflowsPageDialogType.WORKFLOW_CONFIG,
        workflowId: wfId,
        parentWorkflowId,
      })();
    },
    [openDialog],
  );

  const openChainWorkflowDialog = useCallback(
    (wfId: string) => {
      openDialog({
        type: WorkflowsPageDialogType.CHAIN_WORKFLOW,
        workflowId: wfId,
      })();
    },
    [openDialog],
  );

  const handleRemoveChainedWorkflow = useCallback(
    (
      parentWorkflowId: string,
      placement: ChainedWorkflowPlacement,
      deletedWorkflowId: string,
      deletedWorkflowIndex: number,
    ) => {
      removeChainedWorkflow(parentWorkflowId, placement, deletedWorkflowId, deletedWorkflowIndex);

      // Close the dialog if the selected workflow is deleted
      if (deletedWorkflowId === selectedWorkflowId) {
        closeDialog();
      }

      // Close the dialog if the selected workflow is chained to the deleted workflow
      if (WorkflowService.getWorkflowChain(workflows, deletedWorkflowId).includes(selectedWorkflowId)) {
        closeDialog();
      }
    },
    [closeDialog, removeChainedWorkflow, selectedWorkflowId, workflows],
  );

  const openStepSelectorDrawer = useCallback(
    (wfId: string, stepIndex: number) => {
      openDialog({
        type: WorkflowsPageDialogType.STEP_SELECTOR,
        workflowId: wfId,
        stepIndex,
      })();
    },
    [openDialog],
  );

  const handleMoveStep = useCallback(
    (wfId: string, stepIndex: number, targetIndex: number) => {
      moveStep(wfId, stepIndex, targetIndex);

      // Adjust index if the selected step is moved
      if (wfId === selectedWorkflowId && selectedStepIndex === stepIndex) {
        setStepIndex(targetIndex);
      }
    },
    [moveStep, selectedStepIndex, selectedWorkflowId, setStepIndex],
  );

  const handleCloneStep = useCallback(
    (wfId: string, stepIndex: number) => {
      cloneStep(wfId, stepIndex);

      // Adjust index if the selected step is cloned
      if (wfId === selectedWorkflowId && stepIndex === selectedStepIndex) {
        setStepIndex(selectedStepIndex + 1);
      }
    },
    [cloneStep, selectedStepIndex, selectedWorkflowId, setStepIndex],
  );

  const handleDeleteStep = useCallback(
    (wfId: string, stepIndex: number) => {
      deleteStep(wfId, stepIndex);

      // Close the dialog if the selected step is deleted
      if (wfId === selectedWorkflowId && stepIndex === selectedStepIndex) {
        closeDialog();
      }

      // Adjust index if a step is deleted before the selected step
      if (wfId === selectedWorkflowId && stepIndex < selectedStepIndex) {
        setStepIndex(selectedStepIndex - 1);
      }
    },
    [deleteStep, selectedWorkflowId, selectedStepIndex, closeDialog, setStepIndex],
  );

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
          isCollapsable={false}
          containerProps={containerProps} // Selection
          selectedStepIndex={deferredStepIndex}
          selectedWorkflowId={deferredWorkflowId}
          // Workflow actions
          onEditWorkflow={undefined}
          onRemoveWorkflow={undefined}
          onChainWorkflow={openChainWorkflowDialog}
          onChainedWorkflowsUpdate={setChainedWorkflows}
          onRemoveChainedWorkflow={handleRemoveChainedWorkflow}
          onEditChainedWorkflow={openWorkflowConfigDrawer}
          onChainChainedWorkflow={openChainWorkflowDialog}
          // Step actions
          onMoveStep={handleMoveStep}
          onCloneStep={handleCloneStep}
          onDeleteStep={handleDeleteStep}
          onUpgradeStep={upgradeStep}
          onSelectStep={openStepLikeDrawer}
          onAddStep={openStepSelectorDrawer}
        />
      </Box>
    </Box>
  );
};

export default WorkflowCanvasPanel;
