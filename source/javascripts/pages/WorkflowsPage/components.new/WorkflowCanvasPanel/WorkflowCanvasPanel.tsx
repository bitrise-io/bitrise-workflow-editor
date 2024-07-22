import { Box, Card, IconButton, Menu, MenuButton, MenuItem, MenuList } from '@bitrise/bitkit';
import useSelectedWorkflow from '../../hooks/useSelectedWorkflow';
import { isWebsiteMode } from '../../utils/isWebsiteMode';
import { useWorkflowsPageStore } from '../../WorkflowsPage.store';
import { useWorkflows } from '../../hooks/useWorkflows';
import WorkflowSelector from './components/WorkflowSelector/WorkflowSelector';
import { extractWorkflowChain } from '@/models/Workflow';

const WorkflowCanvasPanel = () => {
  const workflows = useWorkflows();
  const { id: selectedWorkflowId } = useSelectedWorkflow();
  const { openChainWorkflowDialog } = useWorkflowsPageStore();
  const isRearrangeDisabled = extractWorkflowChain(workflows, selectedWorkflowId).length <= 1;

  return (
    <Box h="100%" display="flex" flexDir="column">
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
            <MenuItem iconName="Link" onClick={openChainWorkflowDialog}>
              Chain Workflow
            </MenuItem>
            <MenuItem
              iconName="Request"
              isDisabled={isRearrangeDisabled}
              onClick={() => console.log('Open rearrange Workflows dialog')}
            >
              Reorder Workflow chain
            </MenuItem>
            <MenuItem iconName="Trash" onClick={() => console.log('Delete Workflow')} isDanger>
              Delete `{selectedWorkflowId}`
            </MenuItem>
          </MenuList>
        </Menu>

        {isWebsiteMode() && <IconButton iconName="Play" aria-label="Run Workflow" size="md" variant="secondary" />}
      </Box>
      <Box flex="1" overflowY="auto" p="16" bg="background/secondary">
        <Card mx="auto" w={400} h={2048} display="flex" alignItems="center" justifyContent="center">
          {selectedWorkflowId}
        </Card>
      </Box>
    </Box>
  );
};

export default WorkflowCanvasPanel;
