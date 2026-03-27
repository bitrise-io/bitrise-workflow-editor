/* eslint-disable import/no-cycle */
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

function getSourceKey(workflowId?: string, stepBundleId?: string): string {
  if (workflowId) {
    return `workflows:${workflowId}`;
  }

  if (stepBundleId) {
    return `step_bundles:${stepBundleId}`;
  }

  return '';
}

function createSortableItem(
  cvs: string,
  stepIndex: number,
  ctx: { workflowId?: string; stepBundleId?: string },
): SortableStepItem {
  const { workflowId, stepBundleId } = ctx;

  return {
    uniqueId: crypto.randomUUID(),
    stepIndex,
    stepBundleId,
    workflowId,
    cvs,
  };
}

function createInitialSortableItems(
  steps: string[],
  ctx: { workflowId?: string; stepBundleId?: string },
): SortableStepItem[] {
  return steps.map((cvs, stepIndex) => createSortableItem(cvs, stepIndex, ctx));
}

function reconcileSortableItems(
  prev: SortableStepItem[],
  steps: string[],
  ctx: {
    workflowId?: string;
    stepBundleId?: string;
    sourceKey: string;
    initialItems: SortableStepItem[];
  },
): SortableStepItem[] {
  const { workflowId, stepBundleId, sourceKey, initialItems } = ctx;

  if (prev.length === 0) {
    return initialItems;
  }

  const prevSourceKey = getSourceKey(prev[0]?.workflowId, prev[0]?.stepBundleId);

  // If we switched the parent entity, reset (new uniqueIds are fine here).
  if (prevSourceKey !== sourceKey) {
    return initialItems;
  }

  // If steps were added/removed, reset.
  if (prev.length !== steps.length) {
    return initialItems;
  }

  // If the order matches, keep uniqueIds stable and just refresh indices.
  const isSameOrder = prev.every((item, idx) => item.cvs === steps[idx]);
  if (isSameOrder) {
    return prev.map((item, idx) => ({ ...item, stepIndex: idx, workflowId, stepBundleId }));
  }

  // Otherwise reconcile by CVS occurrences (supports duplicates) while preserving uniqueIds.
  const buckets = new Map<string, SortableStepItem[]>();
  prev.forEach((item) => {
    const list = buckets.get(item.cvs) ?? [];
    list.push(item);
    buckets.set(item.cvs, list);
  });

  return steps.map((cvs, idx) => {
    const list = buckets.get(cvs);
    const existing = list?.shift();
    const base = existing ?? createSortableItem(cvs, idx, { workflowId, stepBundleId });

    return {
      ...base,
      cvs,
      stepIndex: idx,
      workflowId,
      stepBundleId,
    };
  });
}

function getSortableItemUniqueIds(sortableItems: SortableStepItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const StepList = ({ stepBundleId, steps, onAdd, onMove, workflowId }: Props) => {
  const id = stepBundleId || workflowId || '';

  const sourceKey = useMemo(() => getSourceKey(workflowId, stepBundleId), [stepBundleId, workflowId]);
  const initialSortableItems: SortableStepItem[] = useMemo(
    () => createInitialSortableItems(steps, { workflowId, stepBundleId }),
    [stepBundleId, steps, workflowId],
  );

  const isEmpty = !steps.length;
  const isSortable = Boolean(onMove);

  const [activeItem, setActiveItem] = useState<SortableStepItem>();
  const [isReordering, setIsReordering] = useState(false);
  const [sortableItems, setSortableItems] = useState<SortableStepItem[]>([]);

  /**
   * Why is this component “more complex than it should be”?
   *
   * - The Bitrise YAML model addresses steps by position (`steps[stepIndex]`). Many read/write paths
   *   (e.g. step bundle cards, container reference lookups) ultimately resolve data by `stepIndex`.
   *   A stale index (even for a single render) can cause out-of-bounds access and hard errors.
   *
   * - Drag & drop introduces a temporary split-brain state: the *visual* order changes immediately,
   *   but the YAML order is committed after the drop animation. During that window we must keep
   *   rendering stable item identities for dnd-kit/React, while still pointing “business reads”
   *   to the correct YAML step via the current `item.stepIndex`.
   *
   * - YAML steps don't have a stable id. `cvs` is not unique (multiple `script` steps, etc.), so we
   *   maintain a UI-only `uniqueId` per rendered item and reconcile it when `steps` changes.
   */

  // Sync sortable state from source steps.
  useEffect(() => {
    if (activeItem || isReordering) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      setSortableItems((prev) =>
        reconcileSortableItems(prev, steps, {
          workflowId,
          stepBundleId,
          sourceKey,
          initialItems: initialSortableItems,
        }),
      );
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [activeItem, initialSortableItems, isReordering, sourceKey, stepBundleId, steps, workflowId]);

  // Avoid a single stale render when the number of steps changes (e.g. workflow deletion).
  // IMPORTANT: Do not sync based on order mismatch, because DnD intentionally reorders
  // `sortableItems` before the YML (and `steps`) is updated.
  const shouldRenderInitialItems = !activeItem && !isReordering && sortableItems.length !== steps.length;
  const itemsToRender = shouldRenderInitialItems ? initialSortableItems : sortableItems;

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

        if (currentActiveIndex === currentOverIndex) {
          setActiveItem(undefined);
          return;
        }

        setIsReordering(true);
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

          setIsReordering(false);
        }, defaultDropAnimation.duration);
      }

      setActiveItem(undefined);
    },
    [id, onMove, sortableItems],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(undefined);
    setIsReordering(false);
  }, []);

  const content = useMemo(() => {
    return (
      <Box display="flex" flexDir="column" gap="8">
        {itemsToRender.map((item, renderIndex) => {
          const isLast = renderIndex === itemsToRender.length - 1;

          return (
            <Fragment key={item.uniqueId}>
              {onAdd && (
                <AddStepButton
                  my={-8}
                  onClick={() => {
                    onAdd(id, renderIndex);
                  }}
                />
              )}
              <StepListItem {...item} stepIndex={item.stepIndex} isSortable={isSortable} />
              {isLast && onAdd && (
                <AddStepButton
                  my={-8}
                  onClick={() => {
                    onAdd(id, renderIndex + 1);
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </Box>
    );
  }, [id, isSortable, itemsToRender, onAdd]);

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
      <SortableContext strategy={verticalListSortingStrategy} items={getSortableItemUniqueIds(itemsToRender)}>
        {content}
      </SortableContext>
      <ScaledDragOverlay>{activeItem && <StepListItem {...activeItem} isDragging isSortable />}</ScaledDragOverlay>
    </DndContext>
  );
};

export default memo(StepList);
