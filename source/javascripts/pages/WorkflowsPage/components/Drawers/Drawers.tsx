import { PropsWithChildren } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import {
  ChainWorkflowDrawer,
  CreateWorkflowDialog,
  StartBuildDialog,
  StepBundleConfigDrawer,
  StepConfigDrawer,
  StepSelectorDrawer,
  WithGroupDrawer,
  WorkflowConfigDrawer,
} from '@/components/unified-editor';
import StepService from '@/core/services/StepService';
import useSearchParams from '@/hooks/useSearchParams';
import { BITRISE_STEP_LIBRARY_URL, LibraryType } from '@/core/models/Step';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '../../WorkflowsPage.store';

const Drawers = ({ children }: PropsWithChildren) => {
  const [, setSearchParams] = useSearchParams();

  const {
    workflowId,
    stepBundleId,
    selectedStepIndices,
    openDialog,
    closeDialog,
    isDialogOpen,
    setWorkflowId,
    unmountDialog,
    isDialogMounted,
    parentWorkflowId,
  } = useWorkflowsPageStore();

  const { addStep, addStepToStepBundle, createWorkflow, getUniqueStepIds, addChainedWorkflow } = useBitriseYmlStore(
    (s) => ({
      addStep: s.addStep,
      addStepToStepBundle: s.addStepToStepBundle,
      createWorkflow: s.createWorkflow,
      getUniqueStepIds: s.getUniqueStepIds,
      addChainedWorkflow: s.addChainedWorkflow,
    }),
  );

  const enabledSteps = new Set(getUniqueStepIds());

  const handleAddStep = (cvs: string) => {
    const { id, library, version } = StepService.parseStepCVS(cvs, BITRISE_STEP_LIBRARY_URL);
    const cvsWithLatestMajorVersion = `${id}@${version.split('.')[0]}`;
    if (library === LibraryType.BUNDLE) {
      if (workflowId) {
        addStep(workflowId, cvs, selectedStepIndices[0]);
      } else {
        addStepToStepBundle(stepBundleId, cvs, selectedStepIndices[0]);
      }
      openDialog({
        type: WorkflowsPageDialogType.STEP_BUNDLE,
        workflowId,
        stepBundleId,
      })();
    } else if (workflowId) {
      addStep(workflowId, cvsWithLatestMajorVersion, selectedStepIndices[0]);
      openDialog({
        type: WorkflowsPageDialogType.STEP_CONFIG,
        workflowId,
      })();
    } else {
      addStepToStepBundle(stepBundleId, cvs, selectedStepIndices[0]);
      openDialog({
        type: WorkflowsPageDialogType.STEP_CONFIG,
        stepBundleId,
      })();
    }
  };

  const handleRenameWorkflow = (newWorkflowId: string) => {
    setWorkflowId(newWorkflowId);
    setSearchParams((p) => (p.workflow_id === workflowId ? { ...p, workflow_id: newWorkflowId } : p));
  };

  const handleRenameStepBundle = (newStepBundleId: string) => {
    setSearchParams((p) => (p.step_bundle_id === stepBundleId ? { ...p, step_bundle_id: newStepBundleId } : p));
  };

  return (
    <>
      {children}

      {isDialogMounted(WorkflowsPageDialogType.START_BUILD) && (
        <StartBuildDialog
          workflowId={workflowId}
          isOpen={isDialogOpen(WorkflowsPageDialogType.START_BUILD)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.CREATE_WORKFLOW) && (
        <CreateWorkflowDialog
          isOpen={isDialogOpen(WorkflowsPageDialogType.CREATE_WORKFLOW)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onCreateWorkflow={createWorkflow}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.CHAIN_WORKFLOW) && (
        <ChainWorkflowDrawer
          size="lg"
          workflowId={workflowId}
          isOpen={isDialogOpen(WorkflowsPageDialogType.CHAIN_WORKFLOW)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onChainWorkflow={addChainedWorkflow}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.STEP_CONFIG) && (
        <StepConfigDrawer
          size="lg"
          stepBundleId={stepBundleId}
          workflowId={workflowId}
          stepIndex={selectedStepIndices[0]}
          isOpen={isDialogOpen(WorkflowsPageDialogType.STEP_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.WITH_GROUP) && (
        <WithGroupDrawer
          size="lg"
          workflowId={workflowId}
          stepIndex={selectedStepIndices[0]}
          isOpen={isDialogOpen(WorkflowsPageDialogType.WITH_GROUP)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.STEP_BUNDLE) && (
        <StepBundleConfigDrawer
          size="lg"
          isOpen={isDialogOpen(WorkflowsPageDialogType.STEP_BUNDLE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onRename={handleRenameStepBundle}
          parentWorkflowId={workflowId}
          stepIndex={selectedStepIndices[0]}
          parentStepBundleId={stepBundleId}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.STEP_SELECTOR) && (
        <StepSelectorDrawer
          size="lg"
          enabledSteps={enabledSteps}
          isOpen={isDialogOpen(WorkflowsPageDialogType.STEP_SELECTOR)}
          onClose={closeDialog}
          onSelectStep={handleAddStep}
          onCloseComplete={unmountDialog}
          parentStepBundleId={stepBundleId}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.WORKFLOW_CONFIG) && (
        <WorkflowConfigDrawer
          size="lg"
          context="workflow"
          workflowId={workflowId}
          parentWorkflowId={parentWorkflowId}
          onRename={handleRenameWorkflow}
          isOpen={isDialogOpen(WorkflowsPageDialogType.WORKFLOW_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}
    </>
  );
};

export default Drawers;
