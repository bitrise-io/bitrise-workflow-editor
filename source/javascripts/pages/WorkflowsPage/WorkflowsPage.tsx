import { Box } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import {
  RunWorkflowDialog,
  StepConfigDrawer,
  StepSelectorDrawer,
  WorkflowConfigDrawer,
  WorkflowConfigPanel,
  WorkflowEmptyState,
} from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import CreateWorkflowDialog from '@/components/unified-editor/CreateWorkflowDialog/CreateWorkflowDialog';
import WorkflowCanvasPanel from './components.new/WorkflowCanvasPanel/WorkflowCanvasPanel';
import ChainWorkflowDrawer from './components.new/ChainWorkflowDrawer/ChainWorkflowDrawer';
import { useWorkflowsPageStore } from './WorkflowsPage.store';
import DeleteWorkflowDialog from './components.new/DeleteWorkflowDialog/DeleteWorkflowDialog';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const WorkflowsPageContent = () => {
  const [{ id: selectedWorkflowId }] = useSelectedWorkflow();
  const { workflowId, stepIndex, isDialogOpen, closeDialog, openCreateWorkflowDialog, openStepConfigDrawer } =
    useWorkflowsPageStore();

  const { addStep, createWorkflow, deleteWorkflow, getUniqueStepIds, addChainedWorkflow } = useBitriseYmlStore(
    useShallow((s) => ({
      addStep: s.addStep,
      createWorkflow: s.createWorkflow,
      deleteWorkflow: s.deleteWorkflow,
      getUniqueStepIds: s.getUniqueStepIds,
      addChainedWorkflow: s.addChainedWorkflow,
    })),
  );

  const {
    enabledSteps,
    isStepConfigDrawerOpen,
    isRunWorkflowDialogOpen,
    isStepSelectorDrawerOpen,
    isChainWorkflowDrawerOpen,
    isCreateWorkflowDialogOpen,
    isDeleteWorkflowDialogOpen,
    isWorkflowConfigDrawerOpen,
  } = {
    enabledSteps: new Set(getUniqueStepIds()),
    isStepConfigDrawerOpen: isDialogOpen === 'step-config-drawer',
    isRunWorkflowDialogOpen: isDialogOpen === 'run-workflow',
    isStepSelectorDrawerOpen: isDialogOpen === 'step-selector-drawer',
    isChainWorkflowDrawerOpen: isDialogOpen === 'chain-workflow',
    isCreateWorkflowDialogOpen: isDialogOpen === 'create-workflow',
    isDeleteWorkflowDialogOpen: isDialogOpen === 'delete-workflow',
    isWorkflowConfigDrawerOpen: isDialogOpen === 'workflow-config-drawer',
  };

  const handleAddStep = (cvs: string) => {
    addStep(workflowId, cvs, stepIndex);
    openStepConfigDrawer(workflowId, stepIndex);
  };

  if (!selectedWorkflowId) {
    return (
      <Box h="100%" display="grid" gridTemplateRows="100%">
        <WorkflowEmptyState onCreateWorkflow={openCreateWorkflowDialog} />
        <CreateWorkflowDialog
          isOpen={isCreateWorkflowDialogOpen}
          onClose={closeDialog}
          onCreateWorkflow={createWorkflow}
        />
      </Box>
    );
  }

  return (
    <>
      <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
        <WorkflowCanvasPanel workflowId={selectedWorkflowId} />
        <WorkflowConfigPanel workflowId={selectedWorkflowId} />
      </Box>

      <RunWorkflowDialog workflowId={workflowId} isOpen={isRunWorkflowDialogOpen} onClose={closeDialog} />

      <CreateWorkflowDialog
        isOpen={isCreateWorkflowDialogOpen}
        onClose={closeDialog}
        onCreateWorkflow={createWorkflow}
      />

      <ChainWorkflowDrawer
        workflowId={workflowId}
        isOpen={isChainWorkflowDrawerOpen}
        onClose={closeDialog}
        onChainWorkflow={addChainedWorkflow}
      />

      <DeleteWorkflowDialog
        isOpen={isDeleteWorkflowDialogOpen}
        onClose={closeDialog}
        onDeleteWorkflow={deleteWorkflow}
      />

      <StepConfigDrawer
        workflowId={workflowId}
        stepIndex={stepIndex}
        isOpen={isStepConfigDrawerOpen}
        onClose={closeDialog}
      />

      <StepSelectorDrawer
        enabledSteps={enabledSteps}
        isOpen={isStepSelectorDrawerOpen}
        onClose={closeDialog}
        onSelectStep={({ cvs }) => handleAddStep(cvs)}
      />

      <WorkflowConfigDrawer workflowId={workflowId} isOpen={isWorkflowConfigDrawerOpen} onClose={closeDialog} />
    </>
  );
};

const WorkflowsPage = ({ yml, onChange }: Props) => {
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <WorkflowsPageContent />
    </BitriseYmlProvider>
  );
};

export default WorkflowsPage;
