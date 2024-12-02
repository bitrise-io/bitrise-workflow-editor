/* eslint-disable import/no-cycle */
import { memo, PropsWithChildren, RefObject, useCallback, useState } from 'react';
import { closestCenter, CollisionDetection, DataRef, DndContext, DragStartEvent, Modifier } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { noop } from 'es-toolkit';
import { SortableWorkflowItem } from '../WorkflowCard.types';
import { dndKitMeasuring } from '../WorkflowCard.const';
import ChainedWorkflowCard from './ChainedWorkflowCard';
import ScaledDragOverlay from './ScaledDragOverlay';

type Props = PropsWithChildren<{
  containerRef?: RefObject<HTMLElement>;
}>;

function isChainedWorkflow(data: DataRef) {
  return Object.keys(data.current ?? {}).includes('parentWorkflowId');
}

const SortableWorkflowsContext = ({ children, containerRef }: Props) => {
  const [activeItem, setActiveItem] = useState<SortableWorkflowItem>();

  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    if (isChainedWorkflow(args.active.data)) {
      const droppableContainers = args.droppableContainers.filter((container) => {
        return isChainedWorkflow(container.data);
      });

      return closestCenter({ ...args, droppableContainers });
    }

    return closestCenter(args);
  }, []);

  const restrictToContainer: Modifier = useCallback(
    (args) => {
      const containerNodeRect = containerRef?.current?.getBoundingClientRect() ?? args.containerNodeRect;
      return restrictToParentElement({ ...args, containerNodeRect });
    },
    [containerRef],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveItem({ ...(event.active.data.current as SortableWorkflowItem) });
  }, []);

  const handleDragEndOrCancel = useCallback(() => {
    setActiveItem(undefined);
  }, []);

  return (
    <DndContext
      autoScroll={false}
      measuring={dndKitMeasuring}
      collisionDetection={customCollisionDetection}
      modifiers={[restrictToVerticalAxis, restrictToContainer]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndOrCancel}
      onDragCancel={handleDragEndOrCancel}
    >
      {children}
      <ScaledDragOverlay>
        {activeItem && <ChainedWorkflowCard {...activeItem} onChainedWorkflowsUpdate={noop} isDragging />}
      </ScaledDragOverlay>
    </DndContext>
  );
};

export default memo(SortableWorkflowsContext);
