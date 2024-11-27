import { memo, useRef } from 'react';
import { Box, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import useWorkflow from '@/hooks/useWorkflow';
import StackAndMachineService from '@/core/models/StackAndMachineService';
import { StepActions, WorkflowActions } from '@/components/unified-editor/WorkflowCard/WorkflowCard.types';
import WorkflowEmptyState from '../WorkflowEmptyState';
import useStacksAndMachines from '../WorkflowConfig/hooks/useStacksAndMachines';
import { useSelection, useWorkflowActions, WorkflowCardContextProvider } from './contexts/WorkflowCardContext';
import StepList from './components/StepList';
import ChainedWorkflowList from './components/ChainedWorkflowList';
import SortableWorkflowsContext from './components/SortableWorkflowsContext';

const HIGHLIGHTED_STYLE = {
  outline: '2px solid',
  outlineColor: 'border/selected',
};

type ContentProps = {
  id: string;
  isCollapsable?: boolean;
  containerProps?: CardProps;
};

const WorkflowCardContent = memo(({ id, isCollapsable, containerProps }: ContentProps) => {
  const { onCreateWorkflow, onChainWorkflow, onEditWorkflow, onRemoveWorkflow } = useWorkflowActions();
  const workflow = useWorkflow(id);
  const containerRef = useRef(null);
  const { data: stacksAndMachines } = useStacksAndMachines();
  const { isOpen, onToggle } = useDisclosure({
    defaultIsOpen: !isCollapsable,
  });

  const { isSelected } = useSelection();
  const isHighlighted = isSelected(id);

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
    <Card
      borderRadius="8"
      variant="elevated"
      minW={0}
      {...containerProps}
      {...(isHighlighted ? HIGHLIGHTED_STYLE : {})}
    >
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
            <ChainedWorkflowList key={`${id}->before_run`} placement="before_run" parentWorkflowId={id} />
            <StepList workflowId={id} />
            <ChainedWorkflowList key={`${id}->after_run`} placement="after_run" parentWorkflowId={id} />
          </Box>
        </SortableWorkflowsContext>
      </Collapse>
    </Card>
  );
});

type Selection = {
  selectedStepIndex?: number;
  selectedWorkflowId?: string;
};
type Props = ContentProps & WorkflowActions & StepActions & Selection;

const WorkflowCard = ({
  id,
  isCollapsable,
  containerProps,
  selectedWorkflowId = '',
  selectedStepIndex = -1,
  ...actions
}: Props) => (
  <WorkflowCardContextProvider
    selectedWorkflowId={selectedWorkflowId}
    selectedStepIndex={selectedStepIndex}
    {...actions}
  >
    <WorkflowCardContent id={id} isCollapsable={isCollapsable} containerProps={containerProps} />
  </WorkflowCardContextProvider>
);

export default memo(WorkflowCard);
