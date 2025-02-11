/* eslint-disable import/no-cycle */
import { Fragment, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { Box, Button, EmptyState } from '@bitrise/bitkit';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { defaultDropAnimation, DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';

import { SortableStepItem } from '../WorkflowCard.types';
import { dndKitMeasuring } from '../WorkflowCard.const';

import StepListItem from './StepListItem';
import AddStepButton from './AddStepButton';
import ScaledDragOverlay from './ScaledDragOverlay';

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
          onMove?.(id, currentActiveIndex, currentOverIndex);
        }, defaultDropAnimation.duration);
      }

      setActiveItem(undefined);
    },
    [id, onMove, sortableItems],
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
        // TODO: Setup title
        title={onAdd ? 'Empty Workflow' : 'Empty Step bundle'}
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
