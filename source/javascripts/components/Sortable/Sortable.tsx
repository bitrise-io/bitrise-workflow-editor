/* eslint-disable react/display-name */
import { forwardRef, useState } from 'react';
import { Box, BoxProps, Button, Card, CardProps } from '@bitrise/bitkit';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ItemProps extends CardProps {
  activatorListeners?: any;
  activatorRef?: (element: HTMLElement | null) => void;
  isActive: boolean;
  handlerStyle?: BoxProps;
}

const Item = forwardRef<HTMLDivElement, ItemProps>((props, ref) => {
  const { activatorListeners, activatorRef, children, cursor, handlerStyle, isActive, ...rest } = props;

  const cardProps: CardProps = {
    _hover: {
      backgroundColor: 'background/secondary',
      borderColor: 'border/regular',
    },
    ...rest,
  };

  const handlerProps: BoxProps = {
    as: 'button',
    cursor: cursor || 'grab',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    padding: '8',
    borderStartRadius: 7,
    color: 'icon/tertiary',
    _hover: {
      backgroundColor: 'background/hover',
      color: 'icon/secondary',
    },
    ...handlerStyle,
  };

  return (
    <Card ref={ref} {...cardProps}>
      <Box visibility={isActive ? 'hidden' : 'visible'} position="relative" padding="16" paddingInlineStart="32">
        <Box {...handlerProps} ref={activatorRef} {...activatorListeners}>
          <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="1" />
            <circle cx="6" cy="2" r="1" />
            <circle cx="2" cy="6" r="1" />
            <circle cx="6" cy="6" r="1" />
            <circle cx="2" cy="10" r="1" />
            <circle cx="6" cy="10" r="1" />
          </svg>
        </Box>
        {children}
      </Box>
    </Card>
  );
});

const SortableItem = (props: CardProps) => {
  const { children } = props;

  const { active, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
    id: children as number,
  });

  const isActive = children === active?.id;

  const style: CardProps = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isActive) {
    style.backgroundColor = 'background/secondary';
    style.borderColor = 'border/hover';
    style.borderStyle = 'dashed';
  }

  return (
    <Item
      isActive={isActive}
      ref={setNodeRef}
      activatorRef={setActivatorNodeRef}
      activatorListeners={listeners}
      {...style}
    >
      {children}
    </Item>
  );
};

const Sortable = () => {
  const [items, setItems] = useState<number[]>([1, 2, 3]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    setActiveId(active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id as number);
      const newIndex = items.indexOf(over?.id as number);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      setActiveId(null);
      console.log(newItems);
    }
  };

  return (
    <>
      <Button marginBlockEnd="32" onClick={() => setItems([...items, items.length + 1])}>
        Add 1 more
      </Button>
      <Box display="flex" flexDirection="column" gap="16">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <SortableContext items={items}>
            {items.map((id) => (
              <SortableItem key={id}>{id}</SortableItem>
            ))}
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <Item
                isActive={false}
                handlerStyle={{ cursor: 'grabbing', _hover: { backgroundColor: 'background/active' } }}
                _hover={{
                  backgroundColor: 'background/secondary',
                  borderColor: 'border/strong',
                  boxShadow: 'large',
                }}
              >
                {activeId}
              </Item>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>
    </>
  );
};

export default Sortable;
