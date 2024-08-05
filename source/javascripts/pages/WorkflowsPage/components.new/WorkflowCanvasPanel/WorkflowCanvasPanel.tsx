import { Box, IconButton } from '@bitrise/bitkit';
import useSelectedWorkflow from '../../hooks/useSelectedWorkflow';
import { isWebsiteMode } from '../../utils/isWebsiteMode';
import { useWorkflowsPageStore } from '../../WorkflowsPage.store';
import WorkflowSelector from './components/WorkflowSelector/WorkflowSelector';
import WorkflowCard from '@/components/WorkflowCard/WorkflowCard';

const WorkflowCanvasPanel = () => {
  const [{ id: selectedWorkflowId }] = useSelectedWorkflow();
  const { openChainWorkflowDialog, openStepConfigDrawer, openStepSelectorDrawer, openDeleteWorkflowDialog } =
    useWorkflowsPageStore();

  return (
    <Box h="100%" display="flex" flexDir="column">
      <Box p="12" display="flex" gap="12" bg="background/primary" borderBottom="1px solid" borderColor="border/regular">
        <WorkflowSelector />

        {isWebsiteMode() && <IconButton iconName="Play" aria-label="Run Workflow" size="md" variant="secondary" />}
      </Box>
      <Box flex="1" overflowY="auto" p="16" bg="background/secondary">
        <WorkflowCard
          id={selectedWorkflowId}
          w={400}
          mx="auto"
          isRoot
          isFixed
          isEditable
          onAddStep={openStepSelectorDrawer}
          onSelectStep={openStepConfigDrawer}
          onChainWorkflow={openChainWorkflowDialog}
          onDeleteWorkflow={openDeleteWorkflowDialog}
        />
      </Box>
    </Box>
  );
};

export default WorkflowCanvasPanel;
