import { Box, IconButton, Menu, MenuButton, MenuItem, MenuList } from '@bitrise/bitkit';
import { useShallow } from 'zustand/react/shallow';
import { WorkflowCard } from '@/components/unified-editor';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
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
    openChainWorkflowDialog,
    openDeleteWorkflowDialog,
    openWorkflowConfigDrawer,
  } = useWorkflowsPageStore();

  return (
    <Box h="100%" display="flex" flexDir="column" minW={[256, 320, 400]}>
      <Box p="12" display="flex" gap="12" bg="background/primary" borderBottom="1px solid" borderColor="border/regular">
        <WorkflowSelector />

        <Menu placement="bottom-end">
          <MenuButton
            as={IconButton}
            size="md"
            variant="secondary"
            iconName="MoreVertical"
            aria-label="Manage Workflows"
          />
          <MenuList>
            <MenuItem iconName="Trash" onClick={openDeleteWorkflowDialog} isDanger>
              Delete '{workflowId}'
            </MenuItem>
          </MenuList>
        </Menu>

        {RuntimeUtils.isWebsiteMode() && (
          <IconButton iconName="Play" aria-label="Run Workflow" size="md" variant="secondary" />
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
