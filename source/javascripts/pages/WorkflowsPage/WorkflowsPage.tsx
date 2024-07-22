import { Box } from '@bitrise/bitkit';
import WorkflowCanvasPanel from './components.new/WorkflowCanvasPanel/WorkflowCanvasPanel';
import WorkflowConfigPanel from './components.new/WorkflowConfigPanel/WorkflowConfigPanel';
import CreateWorkflowDialog from './components.new/CreateWorkflowDialog/CreateWorkflowDialog';
import ChainWorkflowDrawer from './components.new/ChainWorkflowDrawer/ChainWorkflowDrawer';
import { useWorkflowsPageStore } from './WorkflowsPage.store';
import { BitriseYml } from '@/models/BitriseYml';
import { Workflows } from '@/models/Workflow';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';

type Props = {
  yml: BitriseYml;
  onChange: (workflows: Workflows) => void;
};

const WorkflowsPage = ({ yml, onChange: _ }: Props) => {
  const { isDialogOpen, closeDialog } = useWorkflowsPageStore();

  return (
    <BitriseYmlProvider yml={yml}>
      <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
        <WorkflowCanvasPanel />
        <WorkflowConfigPanel />
      </Box>
      <CreateWorkflowDialog onCreate={console.log} onClose={closeDialog} isOpen={isDialogOpen === 'create-workflow'} />
      <ChainWorkflowDrawer
        onChainWorkflow={console.log}
        onClose={closeDialog}
        isOpen={isDialogOpen === 'chain-workflow'}
      />
    </BitriseYmlProvider>
  );
};

export default WorkflowsPage;
