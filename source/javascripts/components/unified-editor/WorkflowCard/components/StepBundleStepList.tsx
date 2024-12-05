import { Fragment, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { Box, EmptyState } from '@bitrise/bitkit';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { dndKitMeasuring } from '../WorkflowCard.const';
import { SortableStepItem, StepActions } from '../WorkflowCard.types';

import StepCard from './StepCard';
import ScaledDragOverlay from './ScaledDragOverlay';

type Props = StepActions & {
  stepBundleId: string;
};

function getSortableItemUniqueIds(sortableItems: SortableStepItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const StepBundleStepList = ({ stepBundleId, ...actions }: Props) => {
  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.step_bundles?.[stepBundleId]?.steps ?? []).map((s) => JSON.stringify(s));
  });

  const initialSortableItems: SortableStepItem[] = useMemo(() => {
    return steps.map((_, stepIndex) => ({
      uniqueId: crypto.randomUUID(),
      stepIndex,
      stepBundleId,
    }));
  }, [stepBundleId, steps]);

  const isEmpty = !steps.length;
  const isSortable = true; // TODO: Boolean(onMoveStep);

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

        // TODO: Move steps inside the step_bundles section of the YML instead of the workflows section
        //
        // setTimeout(() => {
        //   onMoveStep?.(workflowId, currentActiveIndex, currentOverIndex);
        // }, defaultDropAnimation.duration);
      }

      setActiveItem(undefined);
    },
    [sortableItems],
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
          // TODO: Add the AddStepButton components, but they add steps to the step_bundles section of the YML instead of the workflows section
          return (
            <Fragment key={item.stepIndex}>
              <StepCard {...item} isSortable={isSortable} {...actions} />
            </Fragment>
          );
        })}
      </Box>
    );
  }, [actions, isSortable, sortableItems]);

  if (isEmpty) {
    // TODO: Add the AddStep button component, but add step to the step_bundles section of the YML instead of the workflows section
    return <EmptyState paddingY="16" paddingX="16" iconName="Steps" title="Empty Workflow" />;
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
      <ScaledDragOverlay>{activeItem && <StepCard {...activeItem} isDragging isSortable />}</ScaledDragOverlay>
    </DndContext>
  );
};

export default memo(StepBundleStepList);
