/* eslint-disable import/no-cycle */
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Icon } from '@bitrise/bitkit';
import { defaultDropAnimation, useDndContext, useDndMonitor } from '@dnd-kit/core';
import { ChainedWorkflowPlacement as Placement } from '@/core/models/Workflow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useWorkflows } from '@/hooks/useWorkflows';
import { SortableWorkflowItem, StepActions, WorkflowActions } from '../WorkflowCard.types';
import ChainedWorkflowCard from './ChainedWorkflowCard';
import Droppable from './Droppable';

type Props = WorkflowActions &
  StepActions & {
    placement: Placement;
    parentWorkflowId: string;
  };

function anotherPlacement(placement: Placement): Placement {
  return placement === 'after_run' ? 'before_run' : 'after_run';
}

function getChainedWorkflowIds(sortableItems: SortableWorkflowItem[]) {
  return sortableItems.map(({ id }) => id);
}

function getSortableItem(placement: Placement, parentWorkflowId: string) {
  return (id: string, index: number): SortableWorkflowItem => {
    return {
      id,
      index,
      uniqueId: crypto.randomUUID(),
      placement,
      parentWorkflowId,
    };
  };
}

function getSortableItemUniqueIds(sortableItems: SortableWorkflowItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const ChainedWorkflowList = ({ placement, parentWorkflowId, ...actions }: Props) => {
  const workflows = useWorkflows();
  const { droppableContainers } = useDndContext();
  const workflowIds = useMemo(() => Object.keys(workflows), [workflows]);

  const { onChainedWorkflowsUpdate } = actions;

  const isAfterRun = placement === 'after_run';
  const isBeforeRun = placement === 'before_run';
  const isSortable = Boolean(onChainedWorkflowsUpdate);

  const validChainedWorkflowIds = useBitriseYmlStore(({ yml }) => {
    const chainedWorkflowIds = yml.workflows?.[parentWorkflowId]?.[placement] ?? [];
    return chainedWorkflowIds.filter((id) => workflowIds.includes(id));
  });

  const initialSortableItems: SortableWorkflowItem[] = useMemo(() => {
    return validChainedWorkflowIds.map(getSortableItem(placement, parentWorkflowId));
  }, [validChainedWorkflowIds, parentWorkflowId, placement]);

  const [sortableItems, setSortableItems] = useState<SortableWorkflowItem[]>(initialSortableItems);

  const findSortableItem = useCallback(
    (id: string): SortableWorkflowItem | undefined => {
      const node = droppableContainers.get(id);

      if (!node) {
        return;
      }

      return {
        ...(node.data.current as SortableWorkflowItem),
        uniqueId: node.id.toString(),
      };
    },
    [droppableContainers],
  );

  const handleChangePlacement = useCallback(
    (activeId: string, from: Placement, to: Placement) => {
      const item = findSortableItem(activeId);

      if (item) {
        setSortableItems((items) => {
          if (placement === from) {
            return items.filter((i) => i.uniqueId !== activeId);
          }

          if (to === 'before_run' && items.every((i) => i.uniqueId !== activeId)) {
            return [...items, item];
          }

          if (to === 'after_run' && items.every((i) => i.uniqueId !== activeId)) {
            return [item, ...items];
          }

          return items;
        });
      }
    },
    [findSortableItem, placement],
  );

  const handleChangePosition = useCallback(
    (activeId: string, overId: string) => {
      const item = findSortableItem(activeId);

      if (item) {
        setSortableItems((items) => {
          const currentOverIndex = items.findIndex((i) => i.uniqueId === overId);
          const currentActiveIndex = items.findIndex((i) => i.uniqueId === activeId);
          const updatedItems = arrayMove(items, currentActiveIndex, currentOverIndex).filter(Boolean);

          setTimeout(() => {
            onChainedWorkflowsUpdate?.(parentWorkflowId, placement, getChainedWorkflowIds(updatedItems));
          }, defaultDropAnimation.duration);

          return updatedItems;
        });
      }
    },
    [findSortableItem, onChainedWorkflowsUpdate, parentWorkflowId, placement],
  );

  useDndMonitor({
    onDragOver(event) {
      const overId = event.over?.id?.toString();
      const activeId = event.active.id.toString();

      if (activeId && overId && activeId !== overId) {
        const from = sortableItems.some((i) => i.uniqueId === activeId) ? placement : anotherPlacement(placement);
        const to = sortableItems.some((i) => i.uniqueId === overId) ? placement : anotherPlacement(placement);

        if (from !== to) {
          handleChangePlacement(activeId, from, to);
        } else if (sortableItems.length === 0) {
          handleChangePlacement(activeId, from, overId as Placement);
        }
      }
    },
    onDragEnd(event) {
      const overId = event.over?.id.toString();
      const activeId = event.active.id.toString();

      if (activeId && overId) {
        handleChangePosition(activeId, overId);
      }
    },
    onDragCancel() {
      setSortableItems(initialSortableItems);
    },
  });

  useEffect(() => {
    setSortableItems(initialSortableItems);
  }, [initialSortableItems]);

  const isEmpty = sortableItems.length === 0;

  return (
    <SortableContext
      disabled={!isSortable}
      strategy={verticalListSortingStrategy}
      items={getSortableItemUniqueIds(sortableItems)}
    >
      <Box
        gap={8}
        display="flex"
        flexDir="column"
        mt={isEmpty && isAfterRun ? -8 : 0}
        mb={isEmpty && isBeforeRun ? -8 : 0}
      >
        {isAfterRun && !isEmpty && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
        {isAfterRun && isEmpty && <Droppable placement={placement} parentWorkflowId={parentWorkflowId} />}

        {sortableItems.map((item) => (
          <ChainedWorkflowCard key={item.uniqueId} {...item} {...actions} />
        ))}

        {isBeforeRun && isEmpty && <Droppable placement={placement} parentWorkflowId={parentWorkflowId} />}
        {isBeforeRun && !isEmpty && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
      </Box>
    </SortableContext>
  );
};

export default memo(ChainedWorkflowList);
