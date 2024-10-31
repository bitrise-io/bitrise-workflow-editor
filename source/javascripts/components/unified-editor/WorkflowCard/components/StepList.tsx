import { Fragment, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Box, BoxProps, Button, EmptyState } from '@bitrise/bitkit';
import { defaultDropAnimation, DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { SortableStepItem, StepActions } from '../WorkflowCard.types';
import AddStepButton from './AddStepButton';
import StepCard from './StepCard';

type Props = {
  workflowId: string;
  containerProps?: BoxProps;
  stepActions?: StepActions;
};

function getSortableItemUniqueIds(sortableItems: SortableStepItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const StepList = ({ workflowId, containerProps, stepActions }: Props) => {
  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.workflows?.[workflowId]?.steps ?? []).map((s) => JSON.stringify(s));
  });
  const { onAddStepClick, onStepMove, ...actions } = stepActions ?? {};

  const initialSortableItems: SortableStepItem[] = useMemo(() => {
    return steps.map((_, stepIndex) => ({
      uniqueId: crypto.randomUUID(),
      stepIndex,
      workflowId,
    }));
  }, [steps, workflowId]);

  const isEmpty = !steps.length;
  const isSortable = Boolean(onStepMove);

  const [activeItem, setActiveItem] = useState<SortableStepItem>();
  const [sortableItems, setSortableItems] = useState<SortableStepItem[]>(initialSortableItems);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveItem(event.active.data.current as SortableStepItem);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const overId = event.over?.id.toString();
      const activeId = event.active.id.toString();

      if (activeId && overId) {
        const currentOverIndex = sortableItems.findIndex((i) => i.uniqueId === overId);
        const currentActiveIndex = sortableItems.findIndex((i) => i.uniqueId === activeId);
        setSortableItems(arrayMove(sortableItems, currentActiveIndex, currentOverIndex));
        setTimeout(() => {
          onStepMove?.(workflowId, currentActiveIndex, currentOverIndex);
        }, defaultDropAnimation.duration);
      }

      setActiveItem(undefined);
    },
    [onStepMove, sortableItems, workflowId],
  );

  const handleDragCancel = useCallback(() => {
    setSortableItems(initialSortableItems);
    setActiveItem(undefined);
  }, [initialSortableItems]);

  useLayoutEffect(() => {
    setSortableItems(initialSortableItems);
  }, [initialSortableItems]);

  if (isEmpty) {
    return (
      <EmptyState
        paddingY="16"
        paddingX="16"
        iconName="Steps"
        title="Empty Workflow"
        description={onAddStepClick ? 'Add Steps from the library.' : undefined}
      >
        {onAddStepClick && (
          <Button
            size="md"
            variant="secondary"
            alignSelf="stretch"
            leftIconName="PlusCircle"
            onClick={() => onAddStepClick(workflowId, 0)}
          >
            Add Step
          </Button>
        )}
      </EmptyState>
    );
  }

  if (!isSortable) {
    return (
      <Box display="flex" flexDir="column" gap="8" {...containerProps}>
        {sortableItems.map((item) => {
          return <StepCard key={item.uniqueId} {...item} actions={actions} />;
        })}
      </Box>
    );
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        disabled={!isSortable}
        strategy={verticalListSortingStrategy}
        items={getSortableItemUniqueIds(sortableItems)}
      >
        <Box display="flex" flexDir="column" gap="8" {...containerProps}>
          {sortableItems.map((item) => {
            const isLast = item.stepIndex === sortableItems.length - 1;

            return (
              <Fragment key={item.stepIndex}>
                <AddStepButton
                  my={-8}
                  zIndex={10}
                  onClick={onAddStepClick && (() => onAddStepClick(workflowId, item.stepIndex))}
                />
                <StepCard {...item} isSortable actions={actions} />
                {isLast && (
                  <AddStepButton
                    my={-8}
                    zIndex={10}
                    onClick={onAddStepClick && (() => onAddStepClick(workflowId, item.stepIndex + 1))}
                  />
                )}
              </Fragment>
            );
          })}
        </Box>
      </SortableContext>
      <DragOverlay>{activeItem && <StepCard {...activeItem} actions={actions} isDragging isSortable />}</DragOverlay>
    </DndContext>
  );
};

export default StepList;
