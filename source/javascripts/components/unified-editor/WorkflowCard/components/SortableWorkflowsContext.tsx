/* eslint-disable import/no-cycle */
import { memo, PropsWithChildren, RefObject, useCallback, useState } from 'react';
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
import { Portal } from '@bitrise/bitkit';
import { noop } from 'es-toolkit';
import { SortableWorkflowItem } from '../WorkflowCard.types';
import dragOverlayScaleModifier from '../utils/dragOverlayScaleModifier';
import scaleInsensitiveMeasure from '../utils/scaleInsensitiveMeasure';
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
      measuring={{
        draggable: { measure: scaleInsensitiveMeasure },
        droppable: { measure: scaleInsensitiveMeasure },
        dragOverlay: { measure: scaleInsensitiveMeasure },
      }}
    >
      {children}
      <Portal>
        <DragOverlay modifiers={[dragOverlayScaleModifier]} zIndex={5} adjustScale>
          {activeItem && <ChainedWorkflowCard {...activeItem} onChainedWorkflowsUpdate={noop} isDragging />}
        </DragOverlay>
      </Portal>
    </DndContext>
  );
};

export default memo(SortableWorkflowsContext);
