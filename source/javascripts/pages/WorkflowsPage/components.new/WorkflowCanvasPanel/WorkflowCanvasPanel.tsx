import { Box, IconButton, Menu, MenuButton, MenuItem, MenuList } from '@bitrise/bitkit';
import useSelectedWorkflow from '../../hooks/useSelectedWorkflow';
import { isWebsiteMode } from '../../utils/isWebsiteMode';
import { useWorkflowsPageStore } from '../../WorkflowsPage.store';
import WorkflowSelector from './components/WorkflowSelector/WorkflowSelector';
import WorkflowCard from '@/components/WorkflowCard/WorkflowCard';

const WorkflowCanvasPanel = () => {
  const [{ id: selectedWorkflowId }] = useSelectedWorkflow();
  const { openChainWorkflowDialog, openDeleteWorkflowDialog, openStepDrawer } = useWorkflowsPageStore();

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
            <MenuItem iconName="Trash" onClick={openDeleteWorkflowDialog} isDanger>
              Delete '{selectedWorkflowId}'
            </MenuItem>
          </MenuList>
        </Menu>

        {isWebsiteMode() && <IconButton iconName="Play" aria-label="Run Workflow" size="md" variant="secondary" />}
      </Box>
      <Box flex="1" overflowY="auto" p="16" bg="background/secondary">
        <WorkflowCard
          id={selectedWorkflowId}
          w={400}
          mx="auto"
          isFixed
          isEditable
          onClickAddStepButton={openStepDrawer}
        />
      </Box>
    </Box>
  );
};

export default WorkflowCanvasPanel;
