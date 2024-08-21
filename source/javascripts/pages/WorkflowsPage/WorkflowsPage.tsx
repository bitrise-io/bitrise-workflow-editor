import { Box, Drawer } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { BitriseYml } from '@/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import StepConfigDrawer from '@/components/StepConfigDrawer/StepConfigDrawer';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import WorkflowCanvasPanel from './components.new/WorkflowCanvasPanel/WorkflowCanvasPanel';
import WorkflowConfigPanel from './components.new/WorkflowConfigPanel/WorkflowConfigPanel';
import CreateWorkflowDialog from './components.new/CreateWorkflowDialog/CreateWorkflowDialog';
import ChainWorkflowDrawer from './components.new/ChainWorkflowDrawer/ChainWorkflowDrawer';
import { useWorkflowsPageStore } from './WorkflowsPage.store';
import DeleteWorkflowDialog from './components.new/DeleteWorkflowDialog/DeleteWorkflowDialog';
import StepSelectorDrawer from './components.new/StepDrawer/StepDrawer';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const WorkflowsPageContent = () => {
  const { workflowId, stepIndex, isDialogOpen, closeDialog, openStepConfigDrawer } = useWorkflowsPageStore();

  const { addStep, createWorkflow, deleteWorkflow, addChainedWorkflow } = useBitriseYmlStore(
    useShallow((s) => ({
      addStep: s.addStep,
      createWorkflow: s.createWorkflow,
      deleteWorkflow: s.deleteWorkflow,
      addChainedWorkflow: s.addChainedWorkflow,
    })),
  );

  const {
    isStepConfigDrawerOpen,
    isStepSelectorDrawerOpen,
    isChainWorkflowDrawerOpen,
    isCreateWorkflowDialogOpen,
    isDeleteWorkflowDialogOpen,
    isWorkflowConfigDrawerOpen,
  } = {
    isStepConfigDrawerOpen: isDialogOpen === 'step-config-drawer',
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

  return (
    <>
      <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
        <WorkflowCanvasPanel />
        <WorkflowConfigPanel />
      </Box>

      <CreateWorkflowDialog onCreate={createWorkflow} onClose={closeDialog} isOpen={isCreateWorkflowDialogOpen} />

      <ChainWorkflowDrawer
        workflowId={workflowId}
        isOpen={isChainWorkflowDrawerOpen}
        onClose={closeDialog}
        onChainWorkflow={addChainedWorkflow}
      />

      <DeleteWorkflowDialog
        workflowId={workflowId}
        isOpen={isDeleteWorkflowDialogOpen}
        onClose={closeDialog}
        onDeleteWorkflow={deleteWorkflow}
      />

      <StepConfigDrawer {...{ workflowId, stepIndex }} onClose={closeDialog} isOpen={isStepConfigDrawerOpen} />

      <StepSelectorDrawer
        onClose={closeDialog}
        isOpen={isStepSelectorDrawerOpen}
        onStepSelected={({ cvs }) => handleAddStep(cvs)}
      />

      <Drawer title="Workflow Config Drawer" isOpen={isWorkflowConfigDrawerOpen} onClose={closeDialog}>
        Not Implemented Yet
      </Drawer>
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
