/* eslint-disable import/no-cycle */
import { memo, useMemo, useRef } from 'react';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Box, ButtonGroup, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';

import useWorkflow from '@/hooks/useWorkflow';
import DragHandle from '@/components/DragHandle/DragHandle';
import WorkflowService from '@/core/models/WorkflowService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { ChainedWorkflowPlacement as Placement } from '@/core/models/Workflow';

import useReactFlowZoom from '../hooks/useReactFlowZoom';
import { SortableWorkflowItem } from '../WorkflowCard.types';
import { useSelection, useWorkflowActions } from '../contexts/WorkflowCardContext';

import WorkflowStepList from './WorkflowStepList';
import ChainedWorkflowList from './ChainedWorkflowList';
import SortableWorkflowsContext from './SortableWorkflowsContext';

type Props = {
  id: string;
  index: number;
  uniqueId: string;
  placement: Placement;
  isSortable?: boolean;
  isDragging?: boolean;
  parentWorkflowId: string;
};

const ChainedWorkflowCard = ({ id, index, uniqueId, placement, isSortable, isDragging, parentWorkflowId }: Props) => {
  const zoom = useReactFlowZoom();
  const workflow = useWorkflow(id);
  const { isSelected } = useSelection();
  const dependants = useDependantWorkflows({ workflowId: id });
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onToggle } = useDisclosure();
  const { onEditChainedWorkflow, onChainChainedWorkflow, onRemoveChainedWorkflow } = useWorkflowActions();

  const sortable = useSortable({
    id: uniqueId,
    disabled: !isSortable,
    data: {
      id,
      index,
      uniqueId,
      placement,
      parentWorkflowId,
    } satisfies SortableWorkflowItem,
  });

  const style = {
    transition: sortable.transition,
    transform: CSS.Transform.toString(
      sortable.transform && {
        ...sortable.transform,
        y: sortable.transform.y / zoom,
      },
    ),
  };

  const isHighlighted = isSelected(id);
  const isPlaceholder = sortable.isDragging;
  const title = workflow?.userValues?.title || id;

  const cardProps = useMemo(() => {
    const common: CardProps = {
      borderRadius: '4',
      variant: 'outline',
      ...(isDragging ? { borderColor: 'border/hover', boxShadow: 'small' } : {}),
    };

    if (isPlaceholder) {
      return {
        ...common,
        height: 50,
        display: 'flex',
        border: '1px dashed',
        alignItems: 'center',
        color: 'text/secondary',
        justifyContent: 'center',
        textStyle: 'body/sm/regular',
        borderColor: 'border/strong',
        backgroundColor: 'background/secondary',
      };
    }

    return {
      ...common,
      ...(isHighlighted ? { outline: '2px solid', outlineColor: 'border/selected' } : {}),
    };
  }, [isDragging, isHighlighted, isPlaceholder]);

  const buttonGroup = useMemo(() => {
    if (isDragging || (!onEditChainedWorkflow && !onChainChainedWorkflow && !onRemoveChainedWorkflow)) {
      return null;
    }

    return (
      <ButtonGroup spacing="0" display="none" _groupHover={{ display: 'flex' }}>
        {onChainChainedWorkflow && (
          <ControlButton
            size="xs"
            iconName="Link"
            aria-label="Chain Workflows"
            tooltipProps={{ 'aria-label': 'Chain Workflows' }}
            onClick={() => {
              onOpen();
              onChainChainedWorkflow(id);
            }}
          />
        )}
        {onEditChainedWorkflow && (
          <ControlButton
            size="xs"
            iconName="Settings"
            aria-label="Edit Workflow"
            tooltipProps={{ 'aria-label': 'Edit Workflow' }}
            onClick={() => onEditChainedWorkflow(id)}
          />
        )}
        {onRemoveChainedWorkflow && (
          <ControlButton
            isDanger
            size="xs"
            iconName="Trash"
            aria-label="Remove Workflow"
            tooltipProps={{ 'aria-label': 'Remove' }}
            onClick={() => onRemoveChainedWorkflow(parentWorkflowId, placement, id, index)}
          />
        )}
      </ButtonGroup>
    );
  }, [
    id,
    index,
    placement,
    isDragging,
    parentWorkflowId,
    onOpen,
    onEditChainedWorkflow,
    onChainChainedWorkflow,
    onRemoveChainedWorkflow,
  ]);

  if (!workflow) {
    return null;
  }

  return (
    <Card ref={sortable.setNodeRef} {...cardProps} style={style}>
      {!isPlaceholder && (
        <>
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
              isDisabled={isDragging}
              iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
              aria-label={!isDragging ? `${isOpen ? 'Collapse' : 'Expand'} Workflow details` : ''}
              tooltipProps={{
                'aria-label': `${isOpen ? 'Collapse' : 'Expand'} Workflow details`,
              }}
            />

            <Box display="flex" flexDir="column" alignItems="flex-start" justifyContent="center" flex="1" minW={0}>
              <Text textStyle="body/md/semibold" hasEllipsis>
                {title}
              </Text>
              <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
                {placement}
                {' • '}
                {WorkflowService.getUsedByText(dependants)}
              </Text>
            </Box>

            {buttonGroup}
          </Box>

          <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
            <SortableWorkflowsContext containerRef={containerRef}>
              <Box display="flex" flexDir="column" gap="8" p="8" ref={containerRef}>
                <ChainedWorkflowList key={`${id}->before_run`} placement="before_run" parentWorkflowId={id} />

                <WorkflowStepList workflowId={id} />

                <ChainedWorkflowList key={`${id}->after_run`} placement="after_run" parentWorkflowId={id} />
              </Box>
            </SortableWorkflowsContext>
          </Collapse>
        </>
      )}
    </Card>
  );
};

export default memo(ChainedWorkflowCard);
