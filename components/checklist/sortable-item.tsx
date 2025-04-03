"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ChecklistItem as ChecklistItemType } from "@/types";
import { ChecklistItem } from "./item";

interface SortableItemProps {
  id: string;
  item: ChecklistItemType;
  checklistHash: string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function SortableItem({
  id,
  item,
  checklistHash,
  onDelete,
  isDeleting,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? "0.8" : "1",
    zIndex: isDragging ? "50" : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 py-2 px-3 rounded-lg
                hover:bg-accent/10 transition-all duration-200
                ${isDragging ? "bg-accent/20 shadow-md ring-1 ring-primary/50" : ""} 
                ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div
        className="flex-shrink-0 cursor-grab hover:text-primary touch-pan-y"
        {...attributes}
        {...listeners}
        style={{
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <GripVertical
          className="size-5 text-muted-foreground group-hover:text-primary transition-colors duration-200"
          aria-label="Drag to reorder"
        />
      </div>

      <ChecklistItem
        item={item}
        checklistHash={checklistHash}
        onDelete={onDelete}
      />
    </div>
  );
}