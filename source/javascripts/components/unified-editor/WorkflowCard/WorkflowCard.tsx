import { memo, useRef } from 'react';
import { Box, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import useWorkflow from '@/hooks/useWorkflow';
import StackAndMachineService from '@/core/models/StackAndMachineService';
import WorkflowEmptyState from '../WorkflowEmptyState';
import useStacksAndMachines from '../WorkflowConfig/hooks/useStacksAndMachines';
import { StepActions, WorkflowActions } from './WorkflowCard.types';
import StepList from './components/StepList';
import ChainedWorkflowList from './components/ChainedWorkflowList';
import SortableWorkflowsContext from './components/SortableWorkflowsContext';

type Props = WorkflowActions &
  StepActions & {
    id: string;
    isCollapsable?: boolean;
    containerProps?: CardProps;
  };

const WorkflowCard = ({ id, isCollapsable, containerProps, ...actions }: Props) => {
  const workflow = useWorkflow(id);
  const containerRef = useRef(null);
  const { data: stacksAndMachines } = useStacksAndMachines();
  const { isOpen, onToggle, onOpen } = useDisclosure({ defaultIsOpen: !isCollapsable });

  const {
    onCreateWorkflow,
    onEditWorkflow,
    onChainWorkflow,
    onRemoveWorkflow,
    onChainChainedWorkflow,
    onEditChainedWorkflow,
    onRemoveChainedWorkflow,
    onChainedWorkflowsUpdate,
    ...stepActions
  } = actions;

  const workflowActions = {
    onCreateWorkflow,
    onEditChainedWorkflow,
    onChainChainedWorkflow,
    onRemoveChainedWorkflow,
    onChainedWorkflowsUpdate,
  };

  if (!workflow) {
    return <WorkflowEmptyState onCreateWorkflow={() => onCreateWorkflow?.()} />;
  }

  const { selectedStack: stack } = StackAndMachineService.selectStackAndMachine({
    ...stacksAndMachines,
    initialStackId: workflow.userValues.meta?.['bitrise.io']?.stack || '',
    selectedStackId: workflow.userValues.meta?.['bitrise.io']?.stack || '',
    initialMachineTypeId: '',
    selectedMachineTypeId: '',
  });

  return (
    <Card borderRadius="8" variant="elevated" minW={0} {...containerProps}>
      <Box display="flex" alignItems="center" px="8" py="6" gap="4" className="group">
        {isCollapsable && (
          <ControlButton
            size="xs"
            tabIndex={-1} // NOTE: Without this, the tooltip always appears when closing any drawers on the Workflows page.
            className="nopan"
            onClick={onToggle}
            iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} Workflow details`}
            tooltipProps={{
              'aria-label': `${isOpen ? 'Collapse' : 'Expand'} Workflow details`,
            }}
          />
        )}

        <Box display="flex" flexDir="column" alignItems="flex-start" justifyContent="center" flex="1" minW={0}>
          <Text textStyle="body/md/semibold" hasEllipsis>
            {workflow.userValues.title || id}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {stack.name || 'Unknown stack'}
          </Text>
        </Box>

        {onChainWorkflow && (
          <ControlButton
            size="xs"
            display="none"
            iconName="Link"
            className="nopan"
            aria-label="Chain Workflows"
            tooltipProps={{ 'aria-label': 'Chain Workflows' }}
            _groupHover={{ display: 'inline-flex' }}
            onClick={() => {
              onOpen();
              onChainWorkflow(id);
            }}
          />
        )}
        {onEditWorkflow && (
          <ControlButton
            size="xs"
            display="none"
            iconName="Settings"
            className="nopan"
            aria-label="Edit Workflow"
            tooltipProps={{ 'aria-label': 'Edit Workflow' }}
            _groupHover={{ display: 'inline-flex' }}
            onClick={() => onEditWorkflow(id)}
          />
        )}
        {onRemoveWorkflow && (
          <ControlButton
            isDanger
            size="xs"
            display="none"
            iconName="Trash"
            className="nopan"
            aria-label="Remove Workflow"
            tooltipProps={{ 'aria-label': 'Remove Workflow' }}
            _groupHover={{ display: 'inline-flex' }}
            onClick={() => onRemoveWorkflow(id)}
          />
        )}
      </Box>

      <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
        <SortableWorkflowsContext containerRef={containerRef}>
          <Box display="flex" flexDir="column" gap="8" p="8" ref={containerRef}>
            <ChainedWorkflowList
              key={`${id}->before_run`}
              placement="before_run"
              parentWorkflowId={id}
              {...workflowActions}
              {...stepActions}
            />

            <StepList workflowId={id} {...stepActions} />

            <ChainedWorkflowList
              key={`${id}->after_run`}
              placement="after_run"
              parentWorkflowId={id}
              {...workflowActions}
              {...stepActions}
            />
          </Box>
        </SortableWorkflowsContext>
      </Collapse>
    </Card>
  );
};

export default memo(WorkflowCard);
