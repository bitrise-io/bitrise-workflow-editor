import { Fragment, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Box, BoxProps, Card, Text } from '@bitrise/bitkit';
import { defaultDropAnimation, DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { SortableStepItem, WorkflowCardCallbacks } from '../WorkflowCard.types';
import AddStepButton from './AddStepButton';
import StepCard from './StepCard';

type Props = Pick<WorkflowCardCallbacks, 'onAddStepClick' | 'onStepMove' | 'onStepSelect'> & {
  workflowId: string;
  containerProps?: BoxProps;
};

function getSortableItemUniqueIds(sortableItems: SortableStepItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const StepList = ({ workflowId, containerProps, onAddStepClick, onStepMove, onStepSelect }: Props) => {
  const steps = useBitriseYmlStore(
    useShallow(({ yml }) => {
      return (yml.workflows?.[workflowId]?.steps ?? []).map((s) => JSON.stringify(s));
    }),
  );

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
      <Card variant="outline" backgroundColor="background/secondary" px="8" py="16" textAlign="center">
        <Text textStyle="body/sm/regular" color="text/secondary">
          This Workflow is empty.
        </Text>
      </Card>
    );
  }

  if (!isSortable) {
    return (
      <Box display="flex" flexDir="column" gap="8" {...containerProps}>
        {sortableItems.map((item) => {
          const handleStepSelect = onStepSelect && (() => onStepSelect(item.workflowId, item.stepIndex));
          return <StepCard key={item.uniqueId} onClick={handleStepSelect} {...item} />;
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
                <StepCard
                  {...item}
                  isSortable
                  onClick={onStepSelect && (() => onStepSelect(workflowId, item.stepIndex))}
                />
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
      <DragOverlay>{activeItem && <StepCard {...activeItem} isDragging isSortable />}</DragOverlay>
    </DndContext>
  );
};

export default StepList;