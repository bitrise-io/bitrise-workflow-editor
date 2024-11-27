import { useEffect } from 'react';
import { Box } from '@bitrise/bitkit';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { WorkflowConfigPanel, WorkflowEmptyState } from '@/components/unified-editor';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import Drawers from './components/Drawers/Drawers';
import WorkflowCanvasPanel from './components/WorkflowCanvasPanel/WorkflowCanvasPanel';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from './WorkflowsPage.store';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const WorkflowsPageContent = () => {
  const [{ id: selectedWorkflowId }] = useSelectedWorkflow();
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  const closeDialog = useWorkflowsPageStore((s) => s.closeDialog);

  useEffect(() => {
    closeDialog();
  }, [selectedWorkflowId, closeDialog]);

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
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <Drawers />
      <WorkflowsPageContent />
    </BitriseYmlProvider>
  );
};

export default WorkflowsPage;
