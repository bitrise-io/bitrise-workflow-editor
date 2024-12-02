import { Fragment, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Box, Button, EmptyState } from '@bitrise/bitkit';
import { defaultDropAnimation, DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { SortableStepItem, StepActions } from '../WorkflowCard.types';
import { dndKitMeasuring } from '../WorkflowCard.const';
import AddStepButton from './AddStepButton';
import StepCard from './StepCard';
import ScaledDragOverlay from './ScaledDragOverlay';

type Props = StepActions & {
  workflowId: string;
};

function getSortableItemUniqueIds(sortableItems: SortableStepItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const StepList = ({ workflowId, ...stepActions }: Props) => {
  const { onAddStep, onMoveStep, ...actions } = stepActions ?? {};

  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.workflows?.[workflowId]?.steps ?? []).map((s) => JSON.stringify(s));
  });

  const initialSortableItems: SortableStepItem[] = useMemo(() => {
    return steps.map((_, stepIndex) => ({
      uniqueId: crypto.randomUUID(),
      stepIndex,
      workflowId,
    }));
  }, [steps, workflowId]);

  const isEmpty = !steps.length;
  const isSortable = Boolean(onMoveStep);

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
          onMoveStep?.(workflowId, currentActiveIndex, currentOverIndex);
        }, defaultDropAnimation.duration);
      }

      setActiveItem(undefined);
    },
    [onMoveStep, sortableItems, workflowId],
  );

  const handleDragCancel = useCallback(() => {
    setSortableItems(initialSortableItems);
    setActiveItem(undefined);
  }, [initialSortableItems]);

  useLayoutEffect(() => {
    setSortableItems(initialSortableItems);
  }, [initialSortableItems]);

  const content = useMemo(() => {
    return (
      <Box display="flex" flexDir="column" gap="8">
        {sortableItems.map((item) => {
          const isLast = item.stepIndex === sortableItems.length - 1;

          return (
            <Fragment key={item.stepIndex}>
              {onAddStep && <AddStepButton my={-8} onClick={() => onAddStep(workflowId, item.stepIndex)} />}
              <StepCard {...item} isSortable={isSortable} {...actions} />
              {isLast && onAddStep && (
                <AddStepButton my={-8} onClick={() => onAddStep(workflowId, item.stepIndex + 1)} />
              )}
            </Fragment>
          );
        })}
      </Box>
    );
  }, [actions, isSortable, onAddStep, sortableItems, workflowId]);

  if (isEmpty) {
    return (
      <EmptyState
        paddingY="16"
        paddingX="16"
        iconName="Steps"
        title="Empty Workflow"
        description={onAddStep ? 'Add Steps from the library.' : undefined}
      >
        {onAddStep && (
          <Button
            size="md"
            variant="secondary"
            alignSelf="stretch"
            leftIconName="PlusCircle"
            onClick={() => onAddStep(workflowId, 0)}
          >
            Add Step
          </Button>
        )}
      </EmptyState>
    );
  }

  if (!isSortable) {
    return content;
  }

  return (
    <DndContext
      autoScroll={false}
      measuring={dndKitMeasuring}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        disabled={!isSortable}
        strategy={verticalListSortingStrategy}
        items={getSortableItemUniqueIds(sortableItems)}
      >
        {content}
      </SortableContext>
      <ScaledDragOverlay>{activeItem && <StepCard {...activeItem} isDragging isSortable />}</ScaledDragOverlay>
    </DndContext>
  );
};

export default memo(StepList);
