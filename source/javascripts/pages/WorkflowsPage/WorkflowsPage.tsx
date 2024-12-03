import { Box } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { WorkflowConfigPanel, WorkflowEmptyState } from '@/components/unified-editor';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from './WorkflowsPage.store';
import WorkflowCanvasPanel from './components/WorkflowCanvasPanel/WorkflowCanvasPanel';
import Drawers from './components/Drawers/Drawers';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const WorkflowsPageContent = () => {
  const { openDialog } = useWorkflowsPageStore();
  const [{ id: selectedWorkflowId }] = useSelectedWorkflow();

  if (!selectedWorkflowId) {
    return (
      <Box h="100%" display="grid" gridTemplateRows="100%">
        <WorkflowEmptyState onCreateWorkflow={openDialog(WorkflowsPageDialogType.CREATE_WORKFLOW)} />
      </Box>
    );
  }

  return (
    <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
      <WorkflowCanvasPanel workflowId={selectedWorkflowId} />
      <WorkflowConfigPanel workflowId={selectedWorkflowId} />
    </Box>
  );
};

const WorkflowsPage = ({ yml, onChange }: Props) => {
  return (
    <ReactFlowProvider>
      <BitriseYmlProvider yml={yml} onChange={onChange}>
        <Drawers>
          <WorkflowsPageContent />
        </Drawers>
      </BitriseYmlProvider>
    </ReactFlowProvider>
  );
};

export default WorkflowsPage;
