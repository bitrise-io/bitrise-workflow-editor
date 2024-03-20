/* eslint-disable react/display-name */
import { Box, BoxProps, Button, Card, CardProps } from "@bitrise/bitkit";
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
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { forwardRef, useState } from "react";

const Item = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
	return <Card padding="16" cursor="grabbing" ref={ref} {...props} />;
});

const SortableItem = (props: CardProps) => {
	const { children } = props;

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: children as number });

	const style: BoxProps["sx"] = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<Item ref={setNodeRef} sx={style} cursor="grab" {...attributes} {...listeners}>
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
					<DragOverlay>{activeId ? <Item>{activeId}</Item> : null}</DragOverlay>
				</DndContext>
			</Box>
		</>
	);
};

export default Sortable;
