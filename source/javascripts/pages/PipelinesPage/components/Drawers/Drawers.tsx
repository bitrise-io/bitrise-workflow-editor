import { memo, PropsWithChildren } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import {
  ChainWorkflowDrawer,
  StartBuildDialog,
  StepConfigDrawer,
  StepSelectorDrawer,
  WorkflowConfigDrawer,
} from '@/components/unified-editor';
import useSearchParams from '@/hooks/useSearchParams';
import { BITRISE_STEP_LIBRARY_URL, LibraryType } from '@/core/models/Step';
import StepService from '@/core/models/StepService';
import StepBundleConfigDrawer from '@/components/unified-editor/StepBundleConfigDrawer/StepBundleConfigDrawer';
import { PipelinesPageDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import PipelineConfigDrawer from '../PipelineConfigDrawer/PipelineConfigDrawer';
import CreatePipelineDialog from '../CreatePipelineDialog/CreatePipelineDialog';
import WorkflowSelectorDrawer from '../WorkflowSelectorDrawer/WorkflowSelectorDrawer';

const Drawers = ({ children }: PropsWithChildren) => {
  const [, setSearchParams] = useSearchParams();

  const {
    pipelineId,
    stepBundleId,
    workflowId,
    stepIndex,
    parentWorkflowId,
    openDialog,
    closeDialog,
    isDialogOpen,
    unmountDialog,
    setWorkflowId,
    isDialogMounted,
  } = usePipelinesPageStore();

  const { addStep, addStepToStepBundle, createPipeline, getUniqueStepIds, addChainedWorkflow, addWorkflowToPipeline } =
    useBitriseYmlStore((s) => ({
      addStep: s.addStep,
      addStepToStepBundle: s.addStepToStepBundle,
      createPipeline: s.createPipeline,
      getUniqueStepIds: s.getUniqueStepIds,
      addChainedWorkflow: s.addChainedWorkflow,
      addWorkflowToPipeline: s.addWorkflowToPipeline,
    }));

  const handleAddStep = (cvs: string) => {
    const { id, library, version } = StepService.parseStepCVS(cvs, BITRISE_STEP_LIBRARY_URL);
    const cvsWithLatestMajorVersion = `${id}@${version.split('.')[0]}`;
    if (library === LibraryType.BUNDLE) {
      addStep(workflowId, cvs, stepIndex);
    } else if (workflowId) {
      addStep(workflowId, cvsWithLatestMajorVersion, stepIndex);
      openDialog({
        type: PipelinesPageDialogType.STEP_CONFIG,
        pipelineId,
        workflowId,
        stepIndex,
      })();
    } else {
      addStepToStepBundle(stepBundleId, cvs, stepIndex);
      openDialog({
        type: PipelinesPageDialogType.STEP_CONFIG,
        pipelineId,
        workflowId,
        stepBundleId,
        stepIndex,
      })();
    }
  };

  const handleAddWorkflowToPipeline = (selectedWorkflowId: string) => {
    addWorkflowToPipeline(pipelineId, selectedWorkflowId, workflowId);
    closeDialog();
  };

  const handleRenameWorkflow = (newWorkflowId: string) => {
    setWorkflowId(newWorkflowId);
    setSearchParams((p) => (p.workflow_id === workflowId ? { ...p, workflow_id: newWorkflowId } : p));
  };

  return (
    <>
      {children}

      {isDialogMounted(PipelinesPageDialogType.PIPELINE_CONFIG) && (
        <PipelineConfigDrawer
          pipelineId={pipelineId}
          isOpen={isDialogOpen(PipelinesPageDialogType.PIPELINE_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.CREATE_PIPELINE) && (
        <CreatePipelineDialog
          isOpen={isDialogOpen(PipelinesPageDialogType.CREATE_PIPELINE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onCreatePipeline={createPipeline}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.WORKFLOW_SELECTOR) && (
        <WorkflowSelectorDrawer
          pipelineId={pipelineId}
          isOpen={isDialogOpen(PipelinesPageDialogType.WORKFLOW_SELECTOR)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onSelectWorkflow={handleAddWorkflowToPipeline}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.WORKFLOW_CONFIG) && (
        <WorkflowConfigDrawer
          context="pipeline"
          workflowId={workflowId}
          parentWorkflowId={parentWorkflowId}
          onRename={handleRenameWorkflow}
          isOpen={isDialogOpen(PipelinesPageDialogType.WORKFLOW_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.START_BUILD) && (
        <StartBuildDialog
          pipelineId={pipelineId}
          isOpen={isDialogOpen(PipelinesPageDialogType.START_BUILD)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.STEP_BUNDLE) && (
        <StepBundleConfigDrawer
          size="md"
          workflowId={workflowId}
          stepIndex={stepIndex}
          isOpen={isDialogOpen(PipelinesPageDialogType.STEP_BUNDLE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.STEP_SELECTOR) && (
        <StepSelectorDrawer
          enabledSteps={new Set(getUniqueStepIds())}
          isOpen={isDialogOpen(PipelinesPageDialogType.STEP_SELECTOR)}
          onClose={closeDialog}
          onSelectStep={handleAddStep}
          onCloseComplete={unmountDialog}
          showStepBundles={!stepBundleId}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.STEP_CONFIG) && (
        <StepConfigDrawer
          workflowId={workflowId}
          stepBundleId={stepBundleId}
          stepIndex={stepIndex}
          isOpen={isDialogOpen(PipelinesPageDialogType.STEP_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.CHAIN_WORKFLOW) && (
        <ChainWorkflowDrawer
          workflowId={workflowId}
          isOpen={isDialogOpen(PipelinesPageDialogType.CHAIN_WORKFLOW)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onChainWorkflow={addChainedWorkflow}
        />
      )}
    </>
  );
};

export default memo(Drawers);
