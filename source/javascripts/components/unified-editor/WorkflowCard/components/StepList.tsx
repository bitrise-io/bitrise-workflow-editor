import { Fragment, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Box, BoxProps, Button, EmptyState, Portal } from '@bitrise/bitkit';
import { defaultDropAnimation, DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { SortableStepItem, StepActions } from '../WorkflowCard.types';
import dragOverlayScaleModifier from '../utils/dragOverlayScaleModifier';
import scaleInsensitiveMeasure from '../utils/scaleInsensitiveMeasure';
import AddStepButton from './AddStepButton';
import StepCard from './StepCard';

type Props = StepActions & {
  workflowId?: string;
  containerProps?: BoxProps;
  stepBundleId?: string;
};

function getSortableItemUniqueIds(sortableItems: SortableStepItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const StepList = ({ stepBundleId, workflowId, containerProps, ...stepActions }: Props) => {
  const { onAddStep, onMoveStep, ...actions } = stepActions ?? {};
  const parentId = workflowId || stepBundleId || '';
  const steps = useBitriseYmlStore(({ yml }) => {
    if (workflowId) {
      return (yml.workflows?.[workflowId]?.steps ?? []).map((s) => JSON.stringify(s));
    }
    if (stepBundleId) {
      return (yml.step_bundles?.[stepBundleId]?.steps ?? []).map((s) => JSON.stringify(s));
    }
    return [];
  });

  const initialSortableItems: SortableStepItem[] = useMemo(() => {
    return steps.map((_, stepIndex) => ({
      uniqueId: crypto.randomUUID(),
      stepIndex,
      parentId,
    }));
  }, [parentId, steps]);

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
          onMoveStep?.(parentId, currentActiveIndex, currentOverIndex);
        }, defaultDropAnimation.duration);
      }

      setActiveItem(undefined);
    },
    [onMoveStep, parentId, sortableItems],
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
      <Box display="flex" flexDir="column" gap="8" {...containerProps}>
        {sortableItems.map((item) => {
          const isLast = item.stepIndex === sortableItems.length - 1;

          return (
            <Fragment key={item.stepIndex}>
              {onAddStep && <AddStepButton my={-8} onClick={() => onAddStep(parentId, item.stepIndex)} />}
              <StepCard {...item} isSortable={isSortable} {...actions} />
              {isLast && onAddStep && <AddStepButton my={-8} onClick={() => onAddStep(parentId, item.stepIndex + 1)} />}
            </Fragment>
          );
        })}
      </Box>
    );
  }, [actions, containerProps, isSortable, onAddStep, parentId, sortableItems]);

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
            onClick={() => onAddStep(parentId, 0)}
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
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      measuring={{
        draggable: { measure: scaleInsensitiveMeasure },
        droppable: { measure: scaleInsensitiveMeasure },
        dragOverlay: { measure: scaleInsensitiveMeasure },
      }}
    >
      <SortableContext
        disabled={!isSortable}
        strategy={verticalListSortingStrategy}
        items={getSortableItemUniqueIds(sortableItems)}
      >
        {content}
      </SortableContext>
      <Portal>
        <DragOverlay modifiers={[dragOverlayScaleModifier]} zIndex={5} adjustScale>
          {activeItem && <StepCard {...activeItem} isDragging isSortable />}
        </DragOverlay>
      </Portal>
    </DndContext>
  );
};

export default memo(StepList);
