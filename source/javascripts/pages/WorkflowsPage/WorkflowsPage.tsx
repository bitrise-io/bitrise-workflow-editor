import { Box } from '@bitrise/bitkit';
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
  const { workflowId, stepIndex, isDialogOpen, closeDialog } = useWorkflowsPageStore();

  const { deleteWorkflow, addChainedWorkflow } = useBitriseYmlStore(
    useShallow((s) => ({
      deleteWorkflow: s.deleteWorkflow,
      addChainedWorkflow: s.addChainedWorkflow,
    })),
  );

  const {
    noop,
    isChainWorkflowDrawerOpen,
    isDeleteWorkflowDialogOpen,
    isCreateWorkflowDialogOpen,
    isStepConfigDrawerOpen,
    isStepSelectorDrawerOpen,
  } = {
    noop: () => {},
    isChainWorkflowDrawerOpen: isDialogOpen === 'chain-workflow',
    isCreateWorkflowDialogOpen: isDialogOpen === 'create-workflow',
    isDeleteWorkflowDialogOpen: isDialogOpen === 'delete-workflow',
    isStepConfigDrawerOpen: isDialogOpen === 'step-config-drawer',
    isStepSelectorDrawerOpen: isDialogOpen === 'step-selector-drawer',
  };

  return (
    <>
      <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
        <WorkflowCanvasPanel />
        <WorkflowConfigPanel />
      </Box>

      <ChainWorkflowDrawer
        workflowId={workflowId}
        isOpen={isChainWorkflowDrawerOpen}
        onClose={closeDialog}
        onChainWorkflow={addChainedWorkflow}
      />

      <CreateWorkflowDialog onCreate={noop} onClose={closeDialog} isOpen={isCreateWorkflowDialogOpen} />

      <DeleteWorkflowDialog
        workflowId={workflowId}
        isOpen={isDeleteWorkflowDialogOpen}
        onClose={closeDialog}
        onDeleteWorkflow={deleteWorkflow}
      />

      <StepConfigDrawer {...{ workflowId, stepIndex }} onClose={closeDialog} isOpen={isStepConfigDrawerOpen} />
      <StepSelectorDrawer onStepSelected={noop} onClose={closeDialog} isOpen={isStepSelectorDrawerOpen} />
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
