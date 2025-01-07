import { Fragment, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { Box, Button, EmptyState } from '@bitrise/bitkit';
import { defaultDropAnimation, DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { useStepActions } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';
import { dndKitMeasuring } from '../WorkflowCard.const';
import { SortableStepItem, StepActions } from '../WorkflowCard.types';
import AddStepButton from './AddStepButton';
import StepCard from './StepCard';
import ScaledDragOverlay from './ScaledDragOverlay';

type Props = StepActions & {
  stepBundleId: string;
  isPreviewMode?: boolean;
};

function getSortableItemUniqueIds(sortableItems: SortableStepItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const StepBundleStepList = ({ stepBundleId, isPreviewMode, ...actions }: Props) => {
  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.step_bundles?.[stepBundleId]?.steps ?? []).map((s) => JSON.stringify(s));
  });
  const { onAddStepToStepBundle, onMoveStepInStepBundle } = useStepActions();

  const initialSortableItems: SortableStepItem[] = useMemo(() => {
    return steps.map((_, stepIndex) => ({
      uniqueId: crypto.randomUUID(),
      stepIndex,
      stepBundleId,
    }));
  }, [stepBundleId, steps]);

  const isEmpty = !steps.length;
  const isSortable = Boolean(onMoveStepInStepBundle);

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
          onMoveStepInStepBundle?.(stepBundleId, currentActiveIndex, currentOverIndex);
        }, defaultDropAnimation.duration);
      }

      setActiveItem(undefined);
    },
    [onMoveStepInStepBundle, sortableItems, stepBundleId],
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
              {onAddStepToStepBundle && (
                <AddStepButton
                  onClick={() => onAddStepToStepBundle(stepBundleId, item.stepIndex)}
                  showStepBundles={false}
                  my={isPreviewMode ? '0px' : '-8px'}
                />
              )}
              <StepCard {...item} isSortable={isSortable} {...actions} />
              {isLast && onAddStepToStepBundle && (
                <AddStepButton
                  onClick={() => onAddStepToStepBundle(stepBundleId, item.stepIndex + 1)}
                  showStepBundles={false}
                  my={isPreviewMode ? '0px' : '-8px'}
                />
              )}
            </Fragment>
          );
        })}
      </Box>
    );
  }, [actions, isPreviewMode, isSortable, onAddStepToStepBundle, sortableItems, stepBundleId]);

  if (isEmpty) {
    return (
      <EmptyState
        paddingY="16"
        paddingX="16"
        iconName="Steps"
        title="Empty Step bundle"
        description={onAddStepToStepBundle ? 'Add Steps from the library.' : undefined}
      >
        {onAddStepToStepBundle && (
          <Button
            size="md"
            variant="secondary"
            alignSelf="stretch"
            leftIconName="PlusCircle"
            onClick={() => {
              onAddStepToStepBundle(stepBundleId, 0);
            }}
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
      <SortableContext strategy={verticalListSortingStrategy} items={getSortableItemUniqueIds(sortableItems)}>
        {content}
      </SortableContext>
      <ScaledDragOverlay>{activeItem && <StepCard {...activeItem} isDragging isSortable />}</ScaledDragOverlay>
    </DndContext>
  );
};

export default memo(StepBundleStepList);
