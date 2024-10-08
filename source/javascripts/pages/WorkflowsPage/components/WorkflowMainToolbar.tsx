import {
  Box,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Notification,
  Text,
  useDisclosure,
} from '@bitrise/bitkit';

import { RunWorkflowDialog } from '@/components/unified-editor';
import { Workflow } from '@/models';
import WindowUtils from '@/core/utils/WindowUtils';
import WorkflowSelector from './WorkflowSelector/WorkflowSelector';

type WorkflowMainToolbarProps = {
  workflows: Workflow[];
  selectedWorkflow?: Workflow;
  selectWorkflow: (workflow?: Workflow) => void;
  createWorkflow: VoidFunction;
  chainWorkflow: VoidFunction;
  deleteWorkflow: VoidFunction;
  rearrangeWorkflows: VoidFunction;
  uniqueStepCount: number;
  canRunWorkflow: boolean;
  isRunWorkflowDisabled: boolean;
};

const WorkflowMainToolbar = ({
  workflows,
  selectedWorkflow,
  selectWorkflow,
  createWorkflow,
  chainWorkflow,
  deleteWorkflow,
  rearrangeWorkflows,
  uniqueStepCount,
  canRunWorkflow,
  isRunWorkflowDisabled,
}: WorkflowMainToolbarProps): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const workspaceSlug = WindowUtils.workspaceSlug();
  const uniqueStepLimit = WindowUtils.limits()?.uniqueStepLimit;
  const showStepLimit = typeof uniqueStepLimit === 'number';
  const stepLimitReached = uniqueStepLimit && uniqueStepCount >= uniqueStepLimit;
  const upgradeLink = workspaceSlug
    ? `/organization/${workspaceSlug}/credit_subscription/plan_selector_page`
    : undefined;

  const handleOpenRunWorkflowDialog = () => {
    onOpen();
  };

  return (
    <>
      <Box
        p="12"
        gap="12"
        display="flex"
        flexDirection="column"
        bg="background/primary"
        borderBottom="1px solid"
        borderColor="border/regular"
      >
        <Box display="flex" flex="1" alignItems="center" gap="12">
          {selectedWorkflow && (
            <WorkflowSelector
              containerProps={{ flex: 1 }}
              selectedWorkflowId={selectedWorkflow.id}
              workflowIds={workflows.map(({ id }) => id)}
              onCreateWorkflow={createWorkflow}
              onSelectWorkflowId={(workflowId) => selectWorkflow(workflows.find(({ id }) => id === workflowId))}
            />
          )}

          {selectedWorkflow && (
            <Menu placement="bottom-end">
              <MenuButton
                as={IconButton}
                size="md"
                variant="secondary"
                iconName="MoreVertical"
                aria-label="Manage Workflows"
              />
              <MenuList>
                <MenuItem iconName="Link" onClick={chainWorkflow}>
                  Chain Workflow
                </MenuItem>
                <MenuItem
                  iconName="Request"
                  isDisabled={selectedWorkflow.workflowChain(workflows).length === 1}
                  onClick={rearrangeWorkflows}
                >
                  Reorder Workflow chain
                </MenuItem>
                <MenuItem iconName="Trash" onClick={deleteWorkflow} isDanger>
                  Delete `{selectedWorkflow.id}`
                </MenuItem>
              </MenuList>
            </Menu>
          )}

          {canRunWorkflow && (
            <IconButton
              size="md"
              iconName="Play"
              variant="secondary"
              isDisabled={isRunWorkflowDisabled}
              onClick={handleOpenRunWorkflowDialog}
              aria-label={isRunWorkflowDisabled ? 'Save changes to run Workflow' : 'Run Workflow'}
            />
          )}

          {showStepLimit && (
            <Text color="neutral.40" whiteSpace="nowrap">
              {uniqueStepCount}/{uniqueStepLimit} steps used
            </Text>
          )}
        </Box>

        {stepLimitReached && (
          <Notification status="warning">
            <Text size="3" fontWeight="bold">
              You cannot add a new Step now.
            </Text>
            Your team has already reached the limit for this app ({uniqueStepLimit} unique Steps per app) included in
            your current plan. To add more Steps,{' '}
            <Link isUnderlined href={upgradeLink}>
              upgrade your plan first
            </Link>
            .
          </Notification>
        )}
      </Box>

      {selectedWorkflow && <RunWorkflowDialog workflowId={selectedWorkflow?.id} isOpen={isOpen} onClose={onClose} />}
    </>
  );
};

export default WorkflowMainToolbar;
