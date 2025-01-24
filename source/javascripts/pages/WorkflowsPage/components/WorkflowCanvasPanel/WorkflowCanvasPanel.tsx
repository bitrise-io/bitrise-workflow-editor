import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Box, CardProps, IconButton } from '@bitrise/bitkit';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WorkflowService from '@/core/models/WorkflowService';
import { LibraryType } from '@/core/models/Step';
import { ChainedWorkflowPlacement } from '@/core/models/Workflow';
import { useWorkflows } from '@/hooks/useWorkflows';
import { SelectionParent, useWorkflowsPageStore, WorkflowsPageDialogType } from '../../WorkflowsPage.store';
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
  const selectedStepIndices = useWorkflowsPageStore((s) => s.selectedStepIndices);
  const selectionParent = useWorkflowsPageStore((s) => s.selectionParent);
  const setSelectionParent = useWorkflowsPageStore((s) => s.setSelectionParent);
  const setSelectedStepIndices = useWorkflowsPageStore((s) => s.setSelectedStepIndices);
  const closeDialog = useWorkflowsPageStore((s) => s.closeDialog);

  const deferredWorkflowId = useDeferredValue(selectedWorkflowId);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const {
    moveStep,
    cloneStep,
    deleteStep,
    upgradeStep,
    cloneStepInStepBundle,
    deleteStepInStepBundle,
    moveStepInStepBundle,
    upgradeStepInStepBundle,
    setChainedWorkflows,
    removeChainedWorkflow,
  } = useBitriseYmlStore((s) => ({
    moveStep: s.moveStep,
    cloneStep: s.cloneStep,
    deleteStep: s.deleteStep,
    upgradeStep: s.changeStepVersion,
    cloneStepInStepBundle: s.cloneStepInStepBundle,
    deleteStepInStepBundle: s.deleteStepInStepBundle,
    moveStepInStepBundle: s.moveStepInStepBundle,
    upgradeStepInStepBundle: s.changeStepVersionInStepBundle,
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

  const handleSelectStep = useCallback<
    (props: {
      isMultiple?: boolean;
      stepIndex: number;
      type: LibraryType;
      stepBundleId?: string;
      wfId?: string;
    }) => void
  >(
    ({ isMultiple, stepIndex, type, wfId, stepBundleId }) => {
      const newSelectionParent: SelectionParent = {
        id: stepBundleId || wfId || '',
        type: stepBundleId ? 'stepBundle' : 'workflow',
      };
      if (isMultiple) {
        let newIndexes = [...selectedStepIndices, stepIndex];
        if (selectedStepIndices.includes(stepIndex)) {
          newIndexes = selectedStepIndices.filter((i: number) => i !== stepIndex);
        }
        if (newIndexes.length !== 1) {
          closeDialog();
        }
        setSelectedStepIndices(newIndexes);
        setSelectionParent(newSelectionParent);
      } else {
        switch (type) {
          case LibraryType.WITH:
            openDialog({
              type: WorkflowsPageDialogType.WITH_GROUP,
              workflowId: wfId,
              selectedStepIndices: [stepIndex],
              selectionParent: newSelectionParent,
            })();
            break;
          case LibraryType.BUNDLE:
            openDialog({
              type: WorkflowsPageDialogType.STEP_BUNDLE,
              workflowId: wfId,
              selectedStepIndices: [stepIndex],
              selectionParent: newSelectionParent,
            })();
            break;
          default:
            openDialog({
              type: WorkflowsPageDialogType.STEP_CONFIG,
              workflowId: wfId,
              stepBundleId,
              selectedStepIndices: [stepIndex],
              selectionParent: newSelectionParent,
            })();
            break;
        }
      }
    },
    [closeDialog, openDialog, selectedStepIndices, setSelectedStepIndices, setSelectionParent],
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

  const openStepSelectorDrawerFromWorkflow = useCallback(
    (wfId: string, stepIndex: number) => {
      openDialog({
        type: WorkflowsPageDialogType.STEP_SELECTOR,
        workflowId: wfId,
        selectedStepIndices: [stepIndex],
      })();
    },
    [openDialog],
  );

  const openStepSelectorDrawerFromStepBundle = useCallback(
    (stepBundleId: string, stepIndex: number) => {
      openDialog({
        type: WorkflowsPageDialogType.STEP_SELECTOR,
        stepBundleId,
        selectedStepIndices: [stepIndex],
      })();
    },
    [openDialog],
  );

  const handleMoveStep = useCallback(
    (wfId: string, stepIndex: number, targetIndex: number) => {
      moveStep(wfId, stepIndex, targetIndex);

      // Adjust index of the selected steps
      if (selectionParent?.id === wfId && selectionParent?.type === 'workflow') {
        setSelectedStepIndices(
          selectedStepIndices.map((i) => {
            if (i === stepIndex) {
              return targetIndex;
            }
            if (stepIndex < targetIndex && i > stepIndex && i <= targetIndex) {
              return i - 1;
            }
            if (stepIndex > targetIndex && i < stepIndex && i >= targetIndex) {
              return i + 1;
            }
            return i;
          }),
        );
      }
    },
    [moveStep, selectedStepIndices, selectionParent, setSelectedStepIndices],
  );

  const handleCloneStep = useCallback(
    (wfId: string, stepIndex: number) => {
      cloneStep(wfId, stepIndex);

      // Adjust index of the selected steps
      if (selectionParent?.id === wfId && selectionParent?.type === 'workflow') {
        setSelectedStepIndices(
          selectedStepIndices.map((i) => {
            if (i >= stepIndex) {
              return i + 1;
            }
            return i;
          }),
        );
      }
    },
    [cloneStep, selectedStepIndices, selectionParent?.id, selectionParent?.type, setSelectedStepIndices],
  );

  const handleDeleteStep = useCallback(
    (wfId: string, stepIndex: number) => {
      deleteStep(wfId, stepIndex);

      // Close the dialog if the selected step is deleted
      if (selectedStepIndices.includes(stepIndex)) {
        closeDialog();
      }

      if (selectionParent?.id === wfId && selectionParent?.type === 'workflow') {
        setSelectedStepIndices(
          selectedStepIndices.map((i) => {
            if (i >= stepIndex) {
              return i - 1;
            }
            return i;
          }),
        );
      }
    },
    [deleteStep, selectedStepIndices, selectionParent?.id, selectionParent?.type, closeDialog, setSelectedStepIndices],
  );

  const handleCloneStepInStepBundle = useCallback(
    (stepBundleId: string, stepIndex: number) => {
      cloneStepInStepBundle(stepBundleId, stepIndex);

      // Adjust index of the selected steps
      if (selectionParent?.id === stepBundleId && selectionParent?.type === 'stepBundle') {
        setSelectedStepIndices(
          selectedStepIndices.map((i) => {
            if (i >= stepIndex) {
              return i + 1;
            }
            return i;
          }),
        );
      }
    },
    [cloneStepInStepBundle, selectedStepIndices, selectionParent?.id, selectionParent?.type, setSelectedStepIndices],
  );

  const handleDeleteStepInStepBundle = useCallback(
    (stepBundleId: string, stepIndex: number) => {
      deleteStepInStepBundle(stepBundleId, stepIndex);

      // Close the dialog if the selected step is deleted
      if (selectedStepIndices.includes(stepIndex)) {
        closeDialog();
      }
      if (selectionParent?.id === stepBundleId && selectionParent?.type === 'stepBundle') {
        setSelectedStepIndices(
          selectedStepIndices.map((i) => {
            if (i >= stepIndex) {
              return i - 1;
            }
            return i;
          }),
        );
      }
    },
    [
      closeDialog,
      deleteStepInStepBundle,
      selectedStepIndices,
      selectionParent?.id,
      selectionParent?.type,
      setSelectedStepIndices,
    ],
  );

  const handleMoveStepInStepBundle = useCallback(
    (stepBundleId: string, stepIndex: number, targetIndex: number) => {
      moveStepInStepBundle(stepBundleId, stepIndex, targetIndex);

      // Adjust index of the selected steps
      if (selectionParent?.id === stepBundleId && selectionParent?.type === 'stepBundle') {
        setSelectedStepIndices(
          selectedStepIndices.map((i) => {
            if (i === stepIndex) {
              return targetIndex;
            }
            if (stepIndex < targetIndex && i > stepIndex && i <= targetIndex) {
              return i - 1;
            }
            if (stepIndex > targetIndex && i < stepIndex && i >= targetIndex) {
              return i + 1;
            }
            return i;
          }),
        );
      }
    },
    [moveStepInStepBundle, selectedStepIndices, selectionParent?.id, selectionParent?.type, setSelectedStepIndices],
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
          selectedStepIndices={selectedStepIndices}
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
          onSelectStep={handleSelectStep}
          onAddStep={openStepSelectorDrawerFromWorkflow}
          onAddStepToStepBundle={openStepSelectorDrawerFromStepBundle}
          onCloneStepInStepBundle={handleCloneStepInStepBundle}
          onDeleteStepInStepBundle={handleDeleteStepInStepBundle}
          onMoveStepInStepBundle={handleMoveStepInStepBundle}
          onUpgradeStepInStepBundle={upgradeStepInStepBundle}
        />
      </Box>
    </Box>
  );
};

export default WorkflowCanvasPanel;
