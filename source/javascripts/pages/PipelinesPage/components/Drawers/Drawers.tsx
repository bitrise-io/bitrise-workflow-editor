import { PropsWithChildren } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import {
  StartBuildDialog,
  StepConfigDrawer,
  StepSelectorDrawer,
  WorkflowConfigDrawer,
} from '@/components/unified-editor';
import useSearchParams from '@/hooks/useSearchParams';
import { Step } from '@/core/models/Step';
import { PipelineConfigDialogType, usePipelinesPageStore } from '../../PipelinesPage.store';
import PipelineConfigDrawer from '../PipelineConfigDrawer/PipelineConfigDrawer';
import CreatePipelineDialog from '../CreatePipelineDialog/CreatePipelineDialog';
import WorkflowSelectorDrawer from '../WorkflowSelectorDrawer/WorkflowSelectorDrawer';

const Drawers = ({ children }: PropsWithChildren) => {
  const [, setSearchParams] = useSearchParams();

  const {
    pipelineId,
    workflowId,
    stepIndex,
    isDialogMounted,
    isDialogOpen,
    closeDialog,
    unmountDialog,
    setWorkflowId,
  } = usePipelinesPageStore();

  const { addStep, createPipeline, getUniqueStepIds, addWorkflowToPipeline } = useBitriseYmlStore((s) => ({
    addStep: s.addStep,
    createPipeline: s.createPipeline,
    getUniqueStepIds: s.getUniqueStepIds,
    addWorkflowToPipeline: s.addWorkflowToPipeline,
  }));

  const handleAddStep = ({ cvs }: Step) => {
    addStep(workflowId, cvs, stepIndex);
    closeDialog();
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

      {isDialogMounted(PipelineConfigDialogType.PIPELINE_CONFIG) && (
        <PipelineConfigDrawer
          pipelineId={pipelineId}
          isOpen={isDialogOpen(PipelineConfigDialogType.PIPELINE_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelineConfigDialogType.CREATE_PIPELINE) && (
        <CreatePipelineDialog
          isOpen={isDialogOpen(PipelineConfigDialogType.CREATE_PIPELINE)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onCreatePipeline={createPipeline}
        />
      )}

      {isDialogMounted(PipelineConfigDialogType.WORKFLOW_SELECTOR) && (
        <WorkflowSelectorDrawer
          pipelineId={pipelineId}
          isOpen={isDialogOpen(PipelineConfigDialogType.WORKFLOW_SELECTOR)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
          onSelectWorkflow={handleAddWorkflowToPipeline}
        />
      )}

      {isDialogMounted(PipelineConfigDialogType.WORKFLOW_CONFIG) && (
        <WorkflowConfigDrawer
          context="pipeline"
          workflowId={workflowId}
          onRename={handleRenameWorkflow}
          isOpen={isDialogOpen(PipelineConfigDialogType.WORKFLOW_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelineConfigDialogType.START_BUILD) && (
        <StartBuildDialog
          pipelineId={pipelineId}
          isOpen={isDialogOpen(PipelineConfigDialogType.START_BUILD)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelineConfigDialogType.STEP_SELECTOR) && (
        <StepSelectorDrawer
          enabledSteps={new Set(getUniqueStepIds())}
          isOpen={isDialogOpen(PipelineConfigDialogType.STEP_SELECTOR)}
          onClose={closeDialog}
          onSelectStep={handleAddStep}
          onCloseComplete={unmountDialog}
        />
      )}

      {isDialogMounted(PipelineConfigDialogType.STEP_CONFIG) && (
        <StepConfigDrawer
          workflowId={workflowId}
          stepIndex={stepIndex}
          isOpen={isDialogOpen(PipelineConfigDialogType.STEP_CONFIG)}
          onClose={closeDialog}
          onCloseComplete={unmountDialog}
        />
      )}
    </>
  );
};

export default Drawers;
