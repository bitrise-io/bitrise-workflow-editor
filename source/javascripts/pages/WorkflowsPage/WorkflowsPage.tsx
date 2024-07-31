import { Box } from '@bitrise/bitkit';
import WorkflowCanvasPanel from './components.new/WorkflowCanvasPanel/WorkflowCanvasPanel';
import WorkflowConfigPanel from './components.new/WorkflowConfigPanel/WorkflowConfigPanel';
import CreateWorkflowDialog from './components.new/CreateWorkflowDialog/CreateWorkflowDialog';
import ChainWorkflowDrawer from './components.new/ChainWorkflowDrawer/ChainWorkflowDrawer';
import { useWorkflowsPageStore } from './WorkflowsPage.store';
import DeleteWorkflowDialog from './components.new/DeleteWorkflowDialog/DeleteWorkflowDialog';
import StepSelectorDrawer from './components.new/StepDrawer/StepDrawer';
import { BitriseYml } from '@/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import StepConfigDrawer from '@/components/StepConfigDrawer/StepConfigDrawer';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const WorkflowsPage = ({ yml, onChange: _ }: Props) => {
  const { workflowId, stepIndex, isDialogOpen, closeDialog } = useWorkflowsPageStore();

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
    <BitriseYmlProvider yml={yml}>
      <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
        <WorkflowCanvasPanel />
        <WorkflowConfigPanel />
      </Box>

      <ChainWorkflowDrawer onChainWorkflow={noop} onClose={closeDialog} isOpen={isChainWorkflowDrawerOpen} />
      <CreateWorkflowDialog onCreate={noop} onClose={closeDialog} isOpen={isCreateWorkflowDialogOpen} />
      <DeleteWorkflowDialog onClose={closeDialog} isOpen={isDeleteWorkflowDialogOpen} />

      <StepConfigDrawer {...{ workflowId, stepIndex }} onClose={closeDialog} isOpen={isStepConfigDrawerOpen} />
      <StepSelectorDrawer onStepSelected={noop} onClose={closeDialog} isOpen={isStepSelectorDrawerOpen} />
    </BitriseYmlProvider>
  );
};

export default WorkflowsPage;
