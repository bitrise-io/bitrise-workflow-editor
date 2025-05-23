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
import { restrictToParentElement, restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';

import { TriggerType } from '@/core/models/Trigger';
import { LegacyTrigger } from '@/core/models/Trigger.legacy';

import LegacyEmptyState from './LegacyEmptyState';
import OrderOfTriggersNotification from './OrderOfTriggersNotification';
import TriggerCard from './TriggerCard';

type SortableTriggerListProps = {
  type: TriggerType;
  triggers: LegacyTrigger[];
  onReorder: (type: TriggerType, triggers: LegacyTrigger[]) => void;
  onEditItem: (triggerItem: LegacyTrigger) => void;
  onToggleItem: (triggerItem: LegacyTrigger) => void;
  onRemoveItem: (triggerItem: LegacyTrigger) => void;
};

const SortableTriggerList = ({
  type,
  triggers,
  onReorder,
  onEditItem,
  onToggleItem,
  onRemoveItem,
}: SortableTriggerListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = triggers.findIndex((item) => item.uniqueId === active.id);
      const newIndex = triggers.findIndex((item) => item.uniqueId === over?.id);
      const newTriggers = arrayMove(triggers, oldIndex, newIndex);
      setActiveId(null);
      onReorder(type, newTriggers);
    }
  };

  if (!triggers || triggers.length === 0) {
    return <LegacyEmptyState type={type} />;
  }

  return (
    <>
      <div>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
          modifiers={[restrictToParentElement, restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext strategy={verticalListSortingStrategy} items={triggers.map(({ uniqueId }) => uniqueId)}>
            {triggers.map((triggerItem) => (
              <TriggerCard
                key={triggerItem.uniqueId}
                triggerItem={triggerItem}
                onEdit={onEditItem}
                onRemove={onRemoveItem}
                onActiveChange={onToggleItem}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <TriggerCard
                triggerItem={triggers.find(({ uniqueId }) => uniqueId === activeId) || triggers[0]}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      {triggers.length > 1 && <OrderOfTriggersNotification />}
    </>
  );
};

export default SortableTriggerList;
