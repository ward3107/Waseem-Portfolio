import React from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/** dnd-kit produces `DraggableAttributes` + `SyntheticListenerMap` — those
 *  are internal types not exported cleanly, and typing them as generic
 *  records fails on their branded properties. Fall back to `any` here: the
 *  contract is "spread these onto your handle element", nothing else. */
type DragHandleProps = {
  ref: (el: HTMLElement | null) => void;
  style: React.CSSProperties;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners: any;
  isDragging: boolean;
};

interface Props<T extends { id: string }> {
  items: T[];
  onReorder: (nextItems: T[], newOrderIds: string[]) => void;
  disabled?: boolean;
  renderItem: (item: T, handle: DragHandleProps) => React.ReactNode;
}

/**
 * dnd-kit sortable list, y-axis only, keyboard-accessible (arrows / space).
 * `renderItem` gets a `dragHandleProps` bundle to spread onto the drag handle
 * element (typically a small ⋮⋮ icon at the row's start). The row itself is
 * NOT the handle so buttons/links stay clickable.
 */
function SortableRow<T extends { id: string }>({
  item,
  render,
}: {
  item: T;
  render: Props<T>['renderItem'];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return <>{render(item, { ref: setNodeRef, style, attributes, listeners, isDragging })}</>;
}

function DragList<T extends { id: string }>({
  items,
  onReorder,
  disabled,
  renderItem,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(items, oldIndex, newIndex);
    onReorder(next, next.map((i) => i.id));
  };

  if (disabled) {
    return <>{items.map((item) => renderItem(item, disabledHandle))}</>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableRow key={item.id} item={item} render={renderItem} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

const disabledHandle = {
  ref: () => {},
  style: {} as React.CSSProperties,
  attributes: {},
  listeners: {},
  isDragging: false,
};

export default DragList;
