import { memo, PropsWithChildren } from 'react';

import ChainWorkflowDrawer from '@/components/unified-editor/ChainWorkflowDrawer/ChainWorkflowDrawer';
import StartBuildDialog from '@/components/unified-editor/StartBuildDialog/StartBuildDialog';
import StepBundleConfigDrawer from '@/components/unified-editor/StepBundleConfig/StepBundleConfigDrawer';
import StepConfigDrawer from '@/components/unified-editor/StepConfigDrawer/StepConfigDrawer';
import StepSelectorDrawer from '@/components/unified-editor/StepSelectorDrawer/StepSelectorDrawer';
import WorkflowConfigDrawer from '@/components/unified-editor/WorkflowConfig/WorkflowConfigDrawer';
import { BITRISE_STEP_LIBRARY_URL, LibraryType } from '@/core/models/Step';
import StepService from '@/core/services/StepService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useSearchParams from '@/hooks/useSearchParams';

import { PipelinesPageDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import CreatePipelineDialog from '../CreatePipelineDialog/CreatePipelineDialog';
import PipelineConfigDrawer from '../PipelineConfigDrawer/PipelineConfigDrawer';
import WorkflowSelectorDrawer from '../WorkflowSelectorDrawer/WorkflowSelectorDrawer';

const Drawers = ({ children }: PropsWithChildren) => {
  const [, setSearchParams] = useSearchParams();

  const {
    pipelineId,
    stepBundleId,
    workflowId,
    selectedStepIndices,
    parentWorkflowId,
    openDialog,
    closeDialog,
    isDialogOpen,
    unmountDialog,
    setWorkflowId,
    isDialogMounted,
    setStepBundleId,
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
      if (workflowId) {
        addStep(workflowId, cvs, selectedStepIndices[0]);
      } else {
        addStepToStepBundle(stepBundleId, cvs, selectedStepIndices[0]);
      }
      openDialog({
        type: PipelinesPageDialogType.STEP_BUNDLE,
        workflowId,
        stepBundleId,
        selectedStepIndices,
      })();
    } else if (workflowId) {
      addStep(workflowId, cvsWithLatestMajorVersion, selectedStepIndices[0]);
      openDialog({
        type: PipelinesPageDialogType.STEP_CONFIG,
        pipelineId,
        workflowId,
        selectedStepIndices,
      })();
    } else {
      addStepToStepBundle(stepBundleId, cvs, selectedStepIndices[0]);
      openDialog({
        type: PipelinesPageDialogType.STEP_CONFIG,
        pipelineId,
        workflowId,
        stepBundleId,
        selectedStepIndices,
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

  const handleRenameStepBundle = (newStepBundleId: string) => {
    setStepBundleId(newStepBundleId);
    setSearchParams((p) => (p.step_bundle_id === stepBundleId ? { ...p, step_bundle_id: newStepBundleId } : p));
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
          isOpen={isDialogOpen(PipelinesPageDialogType.STEP_BUNDLE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onRename={handleRenameStepBundle}
          parentWorkflowId={workflowId}
          stepIndex={selectedStepIndices[0]}
          parentStepBundleId={stepBundleId}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.STEP_SELECTOR) && (
        <StepSelectorDrawer
          enabledSteps={new Set(getUniqueStepIds())}
          isOpen={isDialogOpen(PipelinesPageDialogType.STEP_SELECTOR)}
          onClose={closeDialog}
          onSelectStep={handleAddStep}
          onCloseComplete={unmountDialog}
          parentStepBundleId={stepBundleId}
        />
      )}

      {isDialogMounted(PipelinesPageDialogType.STEP_CONFIG) && (
        <StepConfigDrawer
          workflowId={workflowId}
          stepBundleId={stepBundleId}
          stepIndex={selectedStepIndices[0]}
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
