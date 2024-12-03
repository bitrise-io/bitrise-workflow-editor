import { PropsWithChildren } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import {
  ChainWorkflowDrawer,
  CreateWorkflowDialog,
  StartBuildDialog,
  StepBundleDrawer,
  StepConfigDrawer,
  StepSelectorDrawer,
  WithGroupDrawer,
  WorkflowConfigDrawer,
} from '@/components/unified-editor';
import StepService from '@/core/models/StepService';
import useSearchParams from '@/hooks/useSearchParams';
import { BITRISE_STEP_LIBRARY_URL, LibraryType } from '@/core/models/Step';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '../../WorkflowsPage.store';

const Drawers = ({ children }: PropsWithChildren) => {
  const [, setSearchParams] = useSearchParams();

  const {
    workflowId,
    stepIndex,
    openDialog,
    closeDialog,
    isDialogOpen,
    setWorkflowId,
    unmountDialog,
    isDialogMounted,
  } = useWorkflowsPageStore();

  const { addStep, createWorkflow, getUniqueStepIds, addChainedWorkflow } = useBitriseYmlStore((s) => ({
    addStep: s.addStep,
    createWorkflow: s.createWorkflow,
    deleteWorkflow: s.deleteWorkflow,
    getUniqueStepIds: s.getUniqueStepIds,
    addChainedWorkflow: s.addChainedWorkflow,
  }));

  const enabledSteps = new Set(getUniqueStepIds());

  const handleAddStep = (cvs: string) => {
    const { id, library, version } = StepService.parseStepCVS(cvs, BITRISE_STEP_LIBRARY_URL);
    if (library === LibraryType.BUNDLE) {
      addStep(workflowId, cvs, stepIndex);
    } else {
      const cvsWithLatestMajorVersion = `${id}@${version.split('.')[0]}`;
      addStep(workflowId, cvsWithLatestMajorVersion, stepIndex);
      openDialog(WorkflowsPageDialogType.STEP_CONFIG, workflowId, stepIndex)();
    }
  };

  const handleRenameWorkflow = (newWorkflowId: string) => {
    setWorkflowId(newWorkflowId);
    setSearchParams((p) => (p.workflow_id === workflowId ? { ...p, workflow_id: newWorkflowId } : p));
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
          workflowId={workflowId}
          isOpen={isDialogOpen(WorkflowsPageDialogType.CHAIN_WORKFLOW)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onChainWorkflow={addChainedWorkflow}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.STEP_CONFIG) && (
        <StepConfigDrawer
          workflowId={workflowId}
          stepIndex={stepIndex}
          isOpen={isDialogOpen(WorkflowsPageDialogType.STEP_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.WITH_GROUP) && (
        <WithGroupDrawer
          workflowId={workflowId}
          stepIndex={stepIndex}
          isOpen={isDialogOpen(WorkflowsPageDialogType.WITH_GROUP)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.STEP_BUNDLE) && (
        <StepBundleDrawer
          workflowId={workflowId}
          stepIndex={stepIndex}
          isOpen={isDialogOpen(WorkflowsPageDialogType.STEP_BUNDLE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.STEP_SELECTOR) && (
        <StepSelectorDrawer
          enabledSteps={enabledSteps}
          isOpen={isDialogOpen(WorkflowsPageDialogType.STEP_SELECTOR)}
          onClose={closeDialog}
          onSelectStep={handleAddStep}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(WorkflowsPageDialogType.WORKFLOW_CONFIG) && (
        <WorkflowConfigDrawer
          context="workflow"
          workflowId={workflowId}
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
