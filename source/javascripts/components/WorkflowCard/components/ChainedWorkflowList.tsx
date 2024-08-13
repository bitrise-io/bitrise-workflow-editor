/* eslint-disable import/no-cycle */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, BoxProps, Icon } from '@bitrise/bitkit';
import { useDndContext, useDndMonitor } from '@dnd-kit/core';
import uniqueId from 'lodash/uniqueId';
import { useShallow } from 'zustand/react/shallow';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { ChainedWorkflowPlacement as Placement } from '@/models/Workflow';
import { SortableWorkflowItem, WorkflowCardCallbacks } from '../WorkflowCard.types';
import ChainedWorkflowCard from './ChainedWorkflowCard';
import Droppable from './Droppable';

type Props = WorkflowCardCallbacks & {
  placement: Placement;
  parentWorkflowId: string;
  containerProps?: BoxProps;
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
      uniqueId: uniqueId(),
      placement,
      parentWorkflowId,
    };
  };
}

function getSortableItemUniqueIds(sortableItems: SortableWorkflowItem[]) {
  return sortableItems.map((i) => i.uniqueId);
}

const ChainedWorkflowList = ({ placement, containerProps, parentWorkflowId, ...callbacks }: Props) => {
  const { onSetChainedWorkflows } = callbacks;
  const isAfterRun = placement === 'after_run';
  const isBeforeRun = placement === 'before_run';
  const isSortable = Boolean(onSetChainedWorkflows);

  const { droppableContainers, active, measureDroppableContainers } = useDndContext();

  const chainedWorkflowIds = useBitriseYmlStore(
    useShallow(({ yml }) => {
      return yml.workflows?.[parentWorkflowId]?.[placement] ?? [];
    }),
  );

  const initialSortableItems: SortableWorkflowItem[] = useMemo(() => {
    return chainedWorkflowIds.map(getSortableItem(placement, parentWorkflowId));
  }, [chainedWorkflowIds, parentWorkflowId, placement]);

  const [sortableItems, setSortableItems] = useState<SortableWorkflowItem[]>(initialSortableItems);

  const findSortableItem = useCallback(
    (id: string): SortableWorkflowItem | undefined => {
      const node = droppableContainers.get(id);

      if (!node) {
        return;
      }

      return { ...(node.data.current as SortableWorkflowItem), uniqueId: node.id.toString() };
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
          onSetChainedWorkflows?.(parentWorkflowId, placement, getChainedWorkflowIds(updatedItems));
          return updatedItems;
        });
      }
    },
    [findSortableItem, onSetChainedWorkflows, parentWorkflowId, placement],
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

  if (sortableItems.length === 0) {
    return (
      <Box
        gap="8"
        display="flex"
        overflow="clip"
        flexDir="column"
        transition="all 250ms"
        height={active ? 74 : 0}
        mt={!active && isAfterRun ? -8 : 0}
        mb={!active && isBeforeRun ? -8 : 0}
        onTransitionEnd={() => measureDroppableContainers(droppableContainers.toArray().map((d) => d.id))}
        {...containerProps}
      >
        {isAfterRun && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
        <Droppable placement={placement} parentWorkflowId={parentWorkflowId} />
        {isBeforeRun && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
      </Box>
    );
  }

  return (
    <SortableContext
      disabled={!isSortable}
      strategy={verticalListSortingStrategy}
      items={getSortableItemUniqueIds(sortableItems)}
    >
      <Box display="flex" flexDir="column" gap="8" {...containerProps}>
        {isAfterRun && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
        {sortableItems.map((item) => (
          <ChainedWorkflowCard key={item.uniqueId} {...item} {...callbacks} />
        ))}
        {isBeforeRun && <Icon name="ArrowDown" size="16" color="icon/tertiary" alignSelf="center" />}
      </Box>
    </SortableContext>
  );
};

export default ChainedWorkflowList;
