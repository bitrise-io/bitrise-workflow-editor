import { memo, useMemo, useRef } from 'react';
import { Box, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';

import useWorkflow from '@/hooks/useWorkflow';
import StackAndMachineService from '@/core/models/StackAndMachineService';

import WorkflowEmptyState from '../WorkflowEmptyState';
import useStacksAndMachines from '../WorkflowConfig/hooks/useStacksAndMachines';
import { useSelection, useWorkflowActions, WorkflowCardContextProvider } from './contexts/WorkflowCardContext';
import WorkflowStepList from './components/WorkflowStepList';
import ChainedWorkflowList from './components/ChainedWorkflowList';
import { StepActions, WorkflowActions } from './WorkflowCard.types';
import SortableWorkflowsContext from './components/SortableWorkflowsContext';

type ContentProps = {
  id: string;
  uses?: string;
  isCollapsable?: boolean;
  containerProps?: CardProps;
};

const WorkflowCardContent = memo(({ id, uses, isCollapsable, containerProps }: ContentProps) => {
  const workflowId = uses || id;

  const containerRef = useRef(null);
  const workflow = useWorkflow(workflowId);
  const { data: stacksAndMachines } = useStacksAndMachines();
  const { isOpen, onOpen, onToggle } = useDisclosure({
    defaultIsOpen: !isCollapsable,
  });
  const { onCreateWorkflow, onChainWorkflow, onEditWorkflow, onRemoveWorkflow } = useWorkflowActions();

  const { isSelected } = useSelection();
  const isHighlighted = isSelected(id);
  const cardPros = useMemo(
    () => ({
      ...containerProps,
      ...(isHighlighted
        ? {
            outline: '2px solid',
            outlineColor: 'border/selected',
          }
        : {}),
    }),
    [containerProps, isHighlighted],
  );

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
    <Card minW={0} borderRadius="8" variant="elevated" {...cardPros}>
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
            {uses ? id : workflow.userValues.title || id}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {uses ? `Uses ${uses}` : stack.name || 'Unknown stack'}
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
              key={`${workflowId}->before_run`}
              placement="before_run"
              parentWorkflowId={workflowId}
            />
            <WorkflowStepList workflowId={workflowId} />
            <ChainedWorkflowList key={`${workflowId}->after_run`} placement="after_run" parentWorkflowId={workflowId} />
          </Box>
        </SortableWorkflowsContext>
      </Collapse>
    </Card>
  );
});

type Selection = {
  selectedWorkflowId?: string;
  selectedStepIndices?: number[];
};
type Props = ContentProps & WorkflowActions & StepActions & Selection;

const WorkflowCard = ({
  id,
  uses,
  isCollapsable,
  containerProps,
  selectedWorkflowId = '',
  selectedStepIndices = [],
  ...actions
}: Props) => (
  <WorkflowCardContextProvider
    selectedWorkflowId={selectedWorkflowId}
    selectedStepIndices={selectedStepIndices}
    {...actions}
  >
    <WorkflowCardContent id={id} uses={uses} isCollapsable={isCollapsable} containerProps={containerProps} />
  </WorkflowCardContextProvider>
);

export default memo(WorkflowCard);
