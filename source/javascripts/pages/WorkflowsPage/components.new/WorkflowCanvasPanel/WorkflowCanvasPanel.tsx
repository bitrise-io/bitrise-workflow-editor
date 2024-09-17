import { Box, IconButton } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflowsPageStore } from '../../WorkflowsPage.store';
import WorkflowSelector from './components/WorkflowSelector/WorkflowSelector';

type Props = {
  workflowId: string;
};

const WorkflowCanvasPanel = ({ workflowId }: Props) => {
  const { moveStep, setChainedWorkflows, deleteChainedWorkflow } = useBitriseYmlStore(
    useShallow((s) => ({
      moveStep: s.moveStep,
      setChainedWorkflows: s.setChainedWorkflows,
      deleteChainedWorkflow: s.deleteChainedWorkflow,
    })),
  );

  const {
    openStepConfigDrawer,
    openStepSelectorDrawer,
    openRunWorkflowDialog,
    openChainWorkflowDialog,
    openDeleteWorkflowDialog,
    openWorkflowConfigDrawer,
  } = useWorkflowsPageStore();

  return (
    <Box h="100%" display="flex" flexDir="column" minW={[256, 320, 400]}>
      <Box p="12" display="flex" gap="12" bg="background/primary" borderBottom="1px solid" borderColor="border/regular">
        <WorkflowSelector />
        <IconButton
          isDanger
          size="md"
          variant="secondary"
          iconName="Trash"
          aria-label={`Delete '${workflowId}'`}
          tooltipProps={{ 'aria-label': `Delete '${workflowId}'` }}
          onClick={openDeleteWorkflowDialog}
        />
        {RuntimeUtils.isWebsiteMode() && (
          <IconButton
            size="md"
            iconName="Play"
            variant="secondary"
            aria-label={
              WorkflowService.isUtilityWorkflow(workflowId) ? "Utility workflows can't be run" : 'Run Workflow'
            }
            tooltipProps={{ 'aria-label': "Utility workflows can't be run" }}
            isDisabled={WorkflowService.isUtilityWorkflow(workflowId)}
            onClick={() => openRunWorkflowDialog(workflowId)}
          />
        )}
      </Box>
      <Box flex="1" overflowY="auto" p="16" bg="background/secondary">
        <WorkflowCard
          id={workflowId}
          onStepMove={moveStep}
          onStepSelect={openStepConfigDrawer}
          onAddStepClick={openStepSelectorDrawer}
          onEditWorkflowClick={openWorkflowConfigDrawer}
          onChainedWorkflowsUpdate={setChainedWorkflows}
          onAddChainedWorkflowClick={openChainWorkflowDialog}
          onDeleteChainedWorkflowClick={deleteChainedWorkflow}
          containerProps={{ maxW: 400, marginX: 'auto' }}
        />
      </Box>
    </Box>
  );
};

export default WorkflowCanvasPanel;
