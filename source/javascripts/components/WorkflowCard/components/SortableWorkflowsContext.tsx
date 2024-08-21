/* eslint-disable import/no-cycle */
import { PropsWithChildren, RefObject, useCallback, useState } from 'react';
import {
  closestCenter,
  CollisionDetection,
  DataRef,
  DndContext,
  DragOverlay,
  DragStartEvent,
  Modifier,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import noop from 'lodash/noop';
import { SortableWorkflowItem } from '../WorkflowCard.types';
import ChainedWorkflowCard from './ChainedWorkflowCard';

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
    setActiveItem({ ...(event.active.data.current as SortableWorkflowItem), uniqueId: event.active.id.toString() });
  }, []);

  const handleDragEndOrCancel = useCallback(() => {
    setActiveItem(undefined);
  }, []);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndOrCancel}
      onDragCancel={handleDragEndOrCancel}
      collisionDetection={customCollisionDetection}
      modifiers={[restrictToVerticalAxis, restrictToContainer]}
    >
      {children}
      <DragOverlay>
        {activeItem && <ChainedWorkflowCard {...activeItem} onChainedWorkflowsUpdate={noop} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};

export default SortableWorkflowsContext;
