/* _eslint-disable import/no-cycle */
import { Box, Button, EmptyState } from '@bitrise/bitkit';
import { defaultDropAnimation, DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { dndKitMeasuring } from '../WorkflowCard.const';
import { SortableStepItem } from '../WorkflowCard.types';
import AddStepButton from './AddStepButton';
import ScaledDragOverlay from './ScaledDragOverlay';
import StepListItem from './StepListItem';

type Props = {
  stepBundleId?: string;
  steps: string[];
  onAdd?: (id: string, stepIndex: number) => void;
  onMove?: (id: string, stepIndex: number, targetIndex: number) => void;
  workflowId?: string;
};

function getSortableItemUniqueIds(sortableItems: SortableStepItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const StepList = ({ stepBundleId, steps, onAdd, onMove, workflowId }: Props) => {
  const id = stepBundleId || workflowId || '';
  const initialSortableItems: SortableStepItem[] = useMemo(() => {
    return steps.map((cvs, stepIndex) => ({
      uniqueId: crypto.randomUUID(),
      stepIndex,
      stepBundleId,
      workflowId,
      cvs,
    }));
  }, [stepBundleId, steps, workflowId]);

  const isEmpty = !steps.length;
  const isSortable = Boolean(onMove);

  const [activeItem, setActiveItem] = useState<SortableStepItem>();
  const [sortableItems, setSortableItems] = useState<SortableStepItem[]>([]);

  useEffect(() => {
    setSortableItems(initialSortableItems);
  }, [initialSortableItems]);

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
        const moveResult = arrayMove(sortableItems, currentActiveIndex, currentOverIndex);
        // Rerenders the reordered list (without changing the YML)
        setSortableItems(moveResult);

        setTimeout(() => {
          // Writes the changes to the YML
          onMove?.(id, currentActiveIndex, currentOverIndex);
          // Updates the stepIndex in the sortable items, since they change during the YML update
          // This is needed to keep the stepIndex in sync with the actual order of the steps in the YML for correct rendering
          setSortableItems((prevResult) => {
            const updatedResult = prevResult.map((item, idx) => ({ ...item, stepIndex: idx }));
            return updatedResult;
          });
        }, defaultDropAnimation.duration);
      }

      setActiveItem(undefined);
    },
    [id, onMove, sortableItems],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(undefined);
  }, []);

  const content = useMemo(() => {
    return (
      <Box display="flex" flexDir="column" gap="8">
        {sortableItems.map((item) => {
          const isLast = item.stepIndex === sortableItems.length - 1;

          return (
            <Fragment key={item.stepIndex}>
              {onAdd && (
                <AddStepButton
                  my={-8}
                  onClick={() => {
                    onAdd(id, item.stepIndex);
                  }}
                />
              )}
              <StepListItem {...item} isSortable={isSortable} />
              {isLast && onAdd && (
                <AddStepButton
                  my={-8}
                  onClick={() => {
                    onAdd(id, item.stepIndex + 1);
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </Box>
    );
  }, [id, isSortable, onAdd, sortableItems]);

  if (isEmpty) {
    return (
      <EmptyState
        paddingY="16"
        paddingX="16"
        iconName="Steps"
        title={onAdd && workflowId ? 'Empty Workflow' : 'Empty Step bundle'}
        description={onAdd ? 'Add Steps from the library.' : undefined}
      >
        {onAdd && (
          <Button
            size="md"
            variant="secondary"
            alignSelf="stretch"
            leftIconName="PlusCircle"
            onClick={() => {
              onAdd(id, 0);
            }}
          >
            Add Step or Step bundle
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
      <SortableContext strategy={verticalListSortingStrategy} items={getSortableItemUniqueIds(sortableItems)}>
        {content}
      </SortableContext>
      <ScaledDragOverlay>{activeItem && <StepListItem {...activeItem} isDragging isSortable />}</ScaledDragOverlay>
    </DndContext>
  );
};

export default memo(StepList);
