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

import WorkflowSelector from '../WorkflowSelector/WorkflowSelector';
import RunWorkflowDialog from '@/components/RunWorkflowDialog/RunWorkflowDialog';
import { useTrackingFunction } from '@/hooks/utils/useTrackingFunction';
import { Workflow } from '@/models';

type WorkflowMainToolbarProps = {
  selectWorkflow: (workflow?: Workflow) => void;
  workflows: Workflow[];
  selectedWorkflow?: Workflow;
  defaultBranch: string;
  uniqueStepCount: number;
  uniqueStepLimit?: number;
  canRunWorkflow: boolean;
  isRunWorkflowDisabled: boolean;
  onAddNewWorkflow: () => void;
  onOpenChainWorkflowDialog: (mode: 'before' | 'after') => void;
  onRearrangeWorkflow: () => void;
  onDeleteSelectedWorkflow: () => void;
  onRunWorkflow: (branch: string) => void;
  organizationSlug?: string;
};

const WorkflowMainToolbar = ({
  defaultBranch,
  canRunWorkflow,
  isRunWorkflowDisabled,
  selectedWorkflow,
  workflows,
  selectWorkflow,
  onAddNewWorkflow,
  onOpenChainWorkflowDialog,
  onRearrangeWorkflow,
  onDeleteSelectedWorkflow,
  onRunWorkflow,
  uniqueStepCount,
  uniqueStepLimit,
  organizationSlug,
}: WorkflowMainToolbarProps): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const showStepLimit = typeof uniqueStepLimit === 'number';
  const stepLimitReached = uniqueStepLimit && uniqueStepCount >= uniqueStepLimit;
  const upgradeLink = organizationSlug
    ? `/organization/${organizationSlug}/credit_subscription/plan_selector_page`
    : undefined;

  const trackDialogOpen = useTrackingFunction(() => ({
    event: 'WFE - Run Workflow Dialog Opened',
    payload: {},
  }));

  const handleOpenRunWorkflowDialog = () => {
    trackDialogOpen();
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
              onClickCreateWorkflowButton={onAddNewWorkflow}
              onSelectWorkflowId={(workflowId) => selectWorkflow(workflows.find(({ id }) => id === workflowId))}
            />
          )}

          {selectedWorkflow && (
            <Menu placement="bottom-end">
              <MenuButton
                as={IconButton}
                size="md"
                variant="secondary"
                iconName="MoreHorizontal"
                aria-label="Manage Workflows"
              />
              <MenuList>
                <MenuItem iconName="ArrowQuit" onClick={() => onOpenChainWorkflowDialog('before')}>
                  Insert Workflow before
                </MenuItem>
                <MenuItem iconName="ArrowQuit" onClick={() => onOpenChainWorkflowDialog('after')}>
                  Insert Workflow after
                </MenuItem>
                <MenuItem
                  iconName="Request"
                  isDisabled={selectedWorkflow.workflowChain(workflows).length === 1}
                  onClick={onRearrangeWorkflow}
                >
                  Change Workflow execution order
                </MenuItem>
                <MenuItem iconName="Trash" onClick={onDeleteSelectedWorkflow} isDanger>
                  Delete selected Workflow
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

      {selectedWorkflow && (
        <RunWorkflowDialog
          workflow={selectedWorkflow?.id}
          isOpen={isOpen}
          onClose={onClose}
          defaultBranch={defaultBranch}
          onAction={(branch) => onRunWorkflow(branch)}
        />
      )}
    </>
  );
};

export default WorkflowMainToolbar;
