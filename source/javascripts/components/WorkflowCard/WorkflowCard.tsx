import { useRef } from 'react';
import { Box, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import useWorkflow from './hooks/useWorkflow';
import StepList from './components/StepList';
import ChainedWorkflowList from './components/ChainedWorkflowList';
import { WorkflowCardCallbacks } from './WorkflowCard.types';
import SortableWorkflowsContext from './components/SortableWorkflowsContext';

type Props = WorkflowCardCallbacks & {
  id: string;
  isCollapsable?: boolean;
  containerProps?: CardProps;
};

const WorkflowCard = ({ id, isCollapsable, containerProps, ...callbacks }: Props) => {
  const { onAddChainedWorkflowClick, onAddStepClick, onStepMove, onStepSelect } = callbacks;
  const stepCallbacks = { onAddStepClick, onStepMove, onStepSelect };

  const containerRef = useRef(null);
  const workflow = useWorkflow(id);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: !isCollapsable });

  if (!workflow) {
    // TODO: Missing empty state
    // eslint-disable-next-line no-console
    console.warn(`Workflow '${id}' is not found in yml!`);
    return null;
  }

  return (
    <Card borderRadius="8" variant="elevated" {...containerProps}>
      <Box display="flex" alignItems="center" px="8" py="6" gap="4" className="group">
        {isCollapsable && (
          <ControlButton
            size="xs"
            tabIndex={-1} // NOTE: Without this, the tooltip always appears when closing any drawers on the Workflows page.
            className="nopan"
            onClick={onToggle}
            iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} workflow details`}
          />
        )}

        <Box display="flex" flexDir="column" alignItems="flex-start" justifyContent="center" flex="1" minW={0}>
          <Text textStyle="body/md/semibold" hasEllipsis>
            {workflow.title || id}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {workflow.meta?.['bitrise.io']?.stack || 'Unknown stack'}
          </Text>
        </Box>

        {onAddChainedWorkflowClick && (
          <ControlButton
            size="xs"
            display="none"
            iconName="PlusOpen"
            aria-label="Chain Workflows"
            _groupHover={{ display: 'block' }}
            onClick={() => onAddChainedWorkflowClick(id)}
          />
        )}
      </Box>

      <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
        <SortableWorkflowsContext containerRef={containerRef}>
          <Box display="flex" flexDir="column" gap="8" p="8" ref={containerRef}>
            <ChainedWorkflowList
              key={`${id}->before_run`}
              {...callbacks}
              placement="before_run"
              parentWorkflowId={id}
              onAddChainedWorkflowClick={onAddChainedWorkflowClick}
            />

            <StepList {...stepCallbacks} workflowId={id} />

            <ChainedWorkflowList
              key={`${id}->after_run`}
              {...callbacks}
              placement="after_run"
              parentWorkflowId={id}
              onAddChainedWorkflowClick={onAddChainedWorkflowClick}
            />
          </Box>
        </SortableWorkflowsContext>
      </Collapse>
    </Card>
  );
};

export default WorkflowCard;
