/* eslint-disable import/no-cycle */
import { CSSProperties, forwardRef, memo, useMemo, useRef } from 'react';
import { Box, BoxProps, ButtonGroup, Card, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChainedWorkflowPlacement as Placement } from '@/core/models/Workflow';
import useWorkflow from '@/hooks/useWorkflow';
import DragHandle from '@/components/DragHandle/DragHandle';
import WorkflowService from '@/core/models/WorkflowService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { SortableWorkflowItem, StepActions, WorkflowActions } from '../WorkflowCard.types';
import useReactFlowZoom from '../hooks/useReactFlowZoom';
import StepList from './StepList';
import ChainedWorkflowList from './ChainedWorkflowList';
import SortableWorkflowsContext from './SortableWorkflowsContext';

type ChainedWorkflowCardProps = WorkflowActions &
  StepActions & {
    id: string;
    index: number;
    uniqueId: string;
    placement: Placement;
    isDragging?: boolean;
    parentWorkflowId: string;
  };

type ChainedWorkflowCardContentProps = ChainedWorkflowCardProps & {
  style?: CSSProperties;
  sortableProps?: ReturnType<typeof useSortable>;
};

const ChainedWorkflowCardContent = memo(
  ({
    id,
    index,
    style,
    uniqueId,
    placement,
    isDragging,
    sortableProps,
    parentWorkflowId,
    ...actions
  }: ChainedWorkflowCardContentProps) => {
    const {
      onCreateWorkflow,
      onEditWorkflow,
      onChainWorkflow,
      onRemoveWorkflow,
      onEditChainedWorkflow,
      onChainChainedWorkflow,
      onRemoveChainedWorkflow,
      onChainedWorkflowsUpdate,
      ...stepActions
    } = actions;

    const result = useWorkflow(id);
    const containerRef = useRef(null);
    const dependants = useDependantWorkflows(id);
    const { isOpen, onToggle, onOpen } = useDisclosure({ defaultIsOpen: false });

    const isEditable = Boolean(onEditChainedWorkflow || onChainChainedWorkflow || onRemoveChainedWorkflow);
    const isSortable = Boolean(onChainedWorkflowsUpdate);

    if (!result) {
      return null;
    }

    const { userValues: workflow } = result;

    return (
      <Card
        borderRadius="4"
        variant="outline"
        ref={sortableProps?.setNodeRef}
        {...(isDragging ? { borderColor: 'border/hover', boxShadow: 'small' } : {})}
        style={style}
      >
        <Box display="flex" alignItems="center" px="8" py="6" gap="4" className="group">
          {isSortable && (
            <DragHandle
              mx="-8"
              my="-6"
              alignSelf="stretch"
              ref={sortableProps?.setActivatorNodeRef}
              {...sortableProps?.listeners}
              {...sortableProps?.attributes}
            />
          )}

          <ControlButton
            size="xs"
            tabIndex={-1} // NOTE: Without this, the tooltip always appears when closing any drawers on the Workflows page.
            className="nopan"
            onClick={onToggle}
            isDisabled={isDragging}
            iconName={isOpen ? 'ChevronUp' : 'ChevronDown'}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} Workflow details`}
            tooltipProps={{
              'aria-label': `${isOpen ? 'Collapse' : 'Expand'} Workflow details`,
            }}
          />

          <Box display="flex" flexDir="column" alignItems="flex-start" justifyContent="center" flex="1" minW={0}>
            <Text textStyle="body/md/semibold" hasEllipsis>
              {workflow.title || id}
            </Text>
            <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
              {placement}
              {' • '}
              {WorkflowService.getUsedByText(dependants)}
            </Text>
          </Box>

          {isEditable && (
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
                  onClick={() => onRemoveChainedWorkflow(index, parentWorkflowId, placement)}
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
                placement="before_run"
                parentWorkflowId={id}
                {...actions}
              />
              <StepList workflowId={id} {...stepActions} />
              <ChainedWorkflowList key={`${id}->after_run`} placement="after_run" parentWorkflowId={id} {...actions} />
            </Box>
          </SortableWorkflowsContext>
        </Collapse>
      </Card>
    );
  },
);

const ChainedWorkflowCardPlaceholder = memo(
  forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
    return (
      <Box
        ref={ref}
        height={50}
        display="flex"
        borderRadius="4"
        border="1px dashed"
        alignItems="center"
        color="text/secondary"
        justifyContent="center"
        textStyle="body/sm/regular"
        borderColor="border/strong"
        backgroundColor="background/secondary"
        {...props}
      />
    );
  }),
);

const ChainedWorkflowCard = memo(
  ({ id, index, uniqueId, placement, parentWorkflowId, ...props }: ChainedWorkflowCardProps) => {
    const zoom = useReactFlowZoom();
    const isSortable = Boolean(props.onChainedWorkflowsUpdate);

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

    const style = useMemo(
      () => ({
        transition: sortable.transition,
        transform: CSS.Transform.toString(
          sortable.transform && { ...sortable.transform, y: sortable.transform.y / zoom },
        ),
      }),
      [sortable.transition, sortable.transform, zoom],
    );

    if (sortable.isDragging) {
      return (
        <ChainedWorkflowCardPlaceholder ref={sortable.setNodeRef} style={style}>
          {id}
        </ChainedWorkflowCardPlaceholder>
      );
    }

    return (
      <ChainedWorkflowCardContent
        id={id}
        style={style}
        index={index}
        uniqueId={uniqueId}
        placement={placement}
        sortableProps={sortable}
        parentWorkflowId={parentWorkflowId}
        {...props}
      />
    );
  },
);

export default ChainedWorkflowCard;
