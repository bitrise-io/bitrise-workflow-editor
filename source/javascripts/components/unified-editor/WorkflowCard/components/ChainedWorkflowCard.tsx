import { Box, ButtonGroup, Card, CardProps, Collapse, ControlButton, Text, useDisclosure } from '@bitrise/bitkit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useMemo, useRef, useState } from 'react';

import { crossFileProvenanceLabel } from '@/components/CrossFileProvenanceText';
import DragHandle from '@/components/DragHandle/DragHandle';
import CrossFileJumpButton from '@/components/JumpToDefinitionLink/CrossFileJumpButton';
import { ChainedWorkflowPlacement as Placement } from '@/core/models/Workflow';
import WorkflowService from '@/core/services/WorkflowService';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import { useCrossFileEntity, useIsMergedConfigSelected, useIsReadOnlyView } from '@/hooks/useTree';
import useWorkflow from '@/hooks/useWorkflow';

import { useSelection, useWorkflowActions } from '../contexts/WorkflowCardContext';
import useReactFlowZoom from '../hooks/useReactFlowZoom';
import { SortableWorkflowItem } from '../WorkflowCard.types';
import ChainedWorkflowList from './ChainedWorkflowList';
import SortableWorkflowsContext from './SortableWorkflowsContext';
import WorkflowStepList from './WorkflowStepList';

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
  const workflow = useWorkflow(id, (s) => (s?.id ? { title: s.userValues.title } : undefined));
  const { isCrossFile, hasDefinition, definingPath } = useCrossFileEntity('workflows', id);
  const isReadOnlyView = useIsReadOnlyView();
  const isMergedView = useIsMergedConfigSelected();
  const showJumpButton = isCrossFile || (isMergedView && hasDefinition);
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

  const [isJumpPopoverOpen, setIsJumpPopoverOpen] = useState(false);

  const isHighlighted = isSelected({ workflowId: id });
  const isPlaceholder = sortable.isDragging;
  const title = workflow?.title || id;

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
      ...(isCrossFile || isReadOnlyView ? { backgroundColor: 'background/secondary' } : {}),
      ...(isHighlighted ? { outline: '2px solid', outlineColor: 'border/selected' } : {}),
    };
  }, [isDragging, isHighlighted, isPlaceholder, isCrossFile, isReadOnlyView]);

  const buttonGroup = useMemo(() => {
    if (
      isDragging ||
      (!onEditChainedWorkflow && !onChainChainedWorkflow && !onRemoveChainedWorkflow && !showJumpButton)
    ) {
      return null;
    }

    return (
      <ButtonGroup spacing="0" display={isJumpPopoverOpen ? 'flex' : 'none'} _groupHover={{ display: 'flex' }}>
        {onChainChainedWorkflow && !isCrossFile && (
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
            onClick={() => onEditChainedWorkflow(id, parentWorkflowId)}
          />
        )}
        {showJumpButton && <CrossFileJumpButton kind="workflows" id={id} onOpenChange={setIsJumpPopoverOpen} />}
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
    isCrossFile,
    showJumpButton,
    isJumpPopoverOpen,
    setIsJumpPopoverOpen,
    parentWorkflowId,
    onOpen,
    onEditChainedWorkflow,
    onChainChainedWorkflow,
    onRemoveChainedWorkflow,
  ]);

  if (!workflow && !isCrossFile) {
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
              isDisabled={isDragging || isCrossFile}
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
                {isCrossFile ? crossFileProvenanceLabel(definingPath) : WorkflowService.getUsedByText(dependants)}
              </Text>
            </Box>

            {buttonGroup}
          </Box>

          {!isCrossFile && (
            <Collapse in={isOpen} transitionEnd={{ enter: { overflow: 'visible' } }} unmountOnExit>
              <SortableWorkflowsContext containerRef={containerRef}>
                <Box display="flex" flexDir="column" gap="8" p="8" ref={containerRef}>
                  <ChainedWorkflowList key={`${id}->before_run`} placement="before_run" parentWorkflowId={id} />

                  <WorkflowStepList workflowId={id} />

                  <ChainedWorkflowList key={`${id}->after_run`} placement="after_run" parentWorkflowId={id} />
                </Box>
              </SortableWorkflowsContext>
            </Collapse>
          )}
        </>
      )}
    </Card>
  );
};

export default memo(ChainedWorkflowCard);
