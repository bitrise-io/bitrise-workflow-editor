/* eslint-disable import/no-cycle */
import { useRef } from 'react';
import { Box, ButtonGroup, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChainedWorkflowPlacement as Placement } from '@/models/Workflow';
import DragHandle from '../../DragHandle/DragHandle';
import useWorkflow from '../hooks/useWorkflow';
import { getUsedByText } from '../WorkflowCard.utils';
import useWorkflowUsedBy from '../hooks/useWorkflowUsedBy';
import { WorkflowCardCallbacks } from '../WorkflowCard.types';
import ChainedWorkflowList from './ChainedWorkflowList';
import StepList from './StepList';
import SortableWorkflowsContext from './SortableWorkflowsContext';

type Props = WorkflowCardCallbacks & {
  id: string;
  index: number;
  uniqueId: string;
  placement: Placement;
  parentWorkflowId: string;
  containerProps?: CardProps;
};

/**
 * TODO
 *  use id as chainedWorkflowId
 *  add uniqueId as unique sortable id
 *  add index as chainedWorkflowIndex
 */
const ChainedWorkflowCard = ({
  id,
  index,
  uniqueId,
  placement,
  parentWorkflowId,
  containerProps,
  ...callbacks
}: Props) => {
  const {
    onEditWorkflowClick,
    onChainedWorkflowsUpdate,
    onAddChainedWorkflowClick,
    onDeleteChainedWorkflowClick,
    ...stepCallbacks
  } = callbacks;

  const isEditable = Boolean(onEditWorkflowClick || onAddChainedWorkflowClick || onDeleteChainedWorkflowClick);
  const isSortable = Boolean(onChainedWorkflowsUpdate);

  const workflow = useWorkflow(id);
  const containerRef = useRef(null);
  const workflowUsedBy = useWorkflowUsedBy(id);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });

  const sortable = useSortable({
    id: uniqueId,
    disabled: !isSortable,
    data: { id, index, placement, parentWorkflowId },
  });

  if (!workflow) {
    // TODO: Missing empty state
    // eslint-disable-next-line no-console
    console.warn(`Workflow '${id}' is not found in yml!`);
    return null;
  }

  if (sortable.isDragging) {
    return (
      <Box
        height={50}
        display="flex"
        borderRadius="4"
        border="1px dashed"
        alignItems="center"
        color="text/secondary"
        justifyContent="center"
        ref={sortable.setNodeRef}
        textStyle="body/sm/regular"
        borderColor="border/strong"
        backgroundColor="background/secondary"
        {...containerProps}
        style={{ transition: sortable.transition, transform: CSS.Transform.toString(sortable.transform) }}
      >
        {id}
      </Box>
    );
  }

  return (
    <Card
      borderRadius="4"
      variant="outline"
      ref={sortable.setNodeRef}
      {...containerProps}
      style={{ transition: sortable.transition, transform: CSS.Transform.toString(sortable.transform) }}
    >
      <Box display="flex" alignItems="center" px="8" py="6" gap="4" className="group">
        {isSortable && (
          <DragHandle
            mx="-8"
            my="-6"
            alignSelf="stretch"
            ref={sortable.setActivatorNodeRef}
            {...sortable.listeners}
            {...sortable.attributes}
          />
        )}

        <ControlButton
          size="xs"
          tabIndex={-1} // NOTE: Without this, the tooltip always appears when closing any drawers on the Workflows page.
          className="nopan"
          onClick={onToggle}
          iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} workflow details`}
        />

        <Box display="flex" flexDir="column" alignItems="flex-start" justifyContent="center" flex="1" minW={0}>
          <Text textStyle="body/md/semibold" hasEllipsis>
            {workflow.title || id}
          </Text>
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {placement}
            {' • '}
            {getUsedByText(workflowUsedBy)}
          </Text>
        </Box>

        {isEditable && (
          <ButtonGroup spacing="0" display="none" _groupHover={{ display: 'flex' }}>
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
            {onEditWorkflowClick && (
              <ControlButton
                size="xs"
                display="none" // NOTE: It should be visibe after WorkflowConfigDrawer implemented.
                iconName="Settings"
                aria-label="Edit Workflow"
                onClick={() => onEditWorkflowClick(id)}
              />
            )}
            {onDeleteChainedWorkflowClick && (
              <ControlButton
                size="xs"
                iconName="Trash"
                aria-label="Remove"
                onClick={() => onDeleteChainedWorkflowClick(index, parentWorkflowId, placement)}
              />
            )}
          </ButtonGroup>
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
            />

            <StepList {...stepCallbacks} workflowId={id} />

            <ChainedWorkflowList key={`${id}->after_run`} {...callbacks} placement="after_run" parentWorkflowId={id} />
          </Box>
        </SortableWorkflowsContext>
      </Collapse>
    </Card>
  );
};

export default ChainedWorkflowCard;
