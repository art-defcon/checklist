"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChecklistTitle } from "@/components/checklist/title";
import { SortableItem } from "@/components/checklist/sortable-item";
import { AddChecklistItem } from "@/components/checklist/add-item";
import { ShareButton } from "@/components/checklist/share-button";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { ChecklistItem as ChecklistItemType } from "@/types";
import Link from "next/link";
import { useAutoSave } from "@/hooks/use-auto-save";

interface ChecklistClientProps {
  checklistHash: string;
  initialTitle: string;
  initialItems: ChecklistItemType[];
  isLoading?: boolean;
}

export function ChecklistClient({
  checklistHash,
  initialTitle,
  initialItems,
  isLoading = false,
}: ChecklistClientProps) {
  const [items, setItems] = useState<ChecklistItemType[]>(initialItems);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);
    setLastFetchTime(Date.now());
  }, []);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Callback to fetch updated items with rate limiting
  const refreshItems = useCallback(async () => {
    if (!isMounted) return;
    
    // Rate limit - don't fetch more than once every 2 seconds
    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      console.log('Rate limited - skipping fetch');
      return;
    }

    try {
      console.log('Fetching items...');
      const response = await fetch(`/api/checklists/${checklistHash}/items`);
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      setItems(data);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error("Error refreshing items:", error);
    }
  }, [checklistHash, isMounted, lastFetchTime]);

  // Handler to delete an item
  const handleDeleteItem = useCallback(
    async (id: string) => {
      if (!isMounted) return;
      try {
        setIsDeleting((prev) => ({ ...prev, [id]: true }));
        const response = await fetch(
          `/api/checklists/${checklistHash}/items/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete item");
        }

        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== id)
        );
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        setIsDeleting((prev) => ({ ...prev, [id]: false }));
      }
    },
    [checklistHash, isMounted]
  );

  // Handler for drag end event
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (!isMounted) return;
      const { active, over } = event;

      if (active.id !== over?.id) {
        try {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);

          // Update local state immediately for responsive UI
          setItems((prevItems) => {
            const newItems = [...prevItems];
            const [removed] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, removed);
            return newItems;
          });

          // Send reorder request to server
          const response = await fetch(
            `/api/checklists/${checklistHash}/items/reorder`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                items: items.map((item, index) => ({
                  id: item.id,
                  position: index,
                })),
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to reorder items");
          }
        } catch (error) {
          console.error("Error reordering items:", error);
        }
      }
    },
    [checklistHash, items, isMounted]
  );

  // Auto-save configuration with longer delay
  useAutoSave({
    data: items,
    onSave: async () => {
      console.log('Auto-saving items...');
      await refreshItems();
    },
    delay: 5000, // Increased from 1000ms to 5000ms
    saveOnUnmount: true
  });

  // Calculate stats
  const totalItems = items.length;
  const completedItems = items.filter((item) => item.isChecked).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="border rounded-lg p-4 sm:p-6 bg-white shadow-sm space-y-4 animate-pulse">
          <div className="flex justify-between">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-full bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 flex-grow bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-10 w-full mt-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="border rounded-lg p-4 sm:p-6 bg-white shadow-sm space-y-6 transition-all duration-200">
        {/* Header with back button and share button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 hover:bg-gray-100 hover:text-primary transition-colors duration-200"
            asChild
          >
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              Back
            </Link>
          </Button>

          <ShareButton />
        </div>

        {/* Checklist title */}
        <ChecklistTitle
          initialTitle={initialTitle}
          checklistHash={checklistHash}
        />

        {/* Progress indicator */}
        {totalItems > 0 && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {completedItems} of {totalItems} completed
            </div>
          </div>
        )}

        {/* Items container */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements: {
              onDragStart({ active }) {
                return `Picked up item ${active.id}`;
              },
              onDragOver({ active, over }) {
                return `Moving item ${active.id} over ${over?.id}`;
              },
              onDragEnd({ active, over }) {
                return `Dropped item ${active.id} ${
                  over?.id ? `over ${over.id}` : "back to original position"
                }`;
              },
              onDragCancel({ active }) {
                return `Dragging cancelled. Item ${active.id} was dropped.`;
              },
            },
          }}
        >
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2" role="list" aria-label="Checklist items">
              {items.length > 0 ? (
                items.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    checklistHash={checklistHash}
                    onDelete={handleDeleteItem}
                    isDeleting={!!isDeleting[item.id]}
                  />
                ))
              ) : (
                <div 
                  className="py-8 text-center rounded-lg border border-dashed bg-gray-50 animate-in fade-in-50"
                  role="status"
                  aria-live="polite"
                >
                  <div className="text-gray-600 mb-2">
                    Your checklist is empty
                  </div>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Click the input below to add your first item. 
                    You can drag items to reorder them or mark them as complete.
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add new item */}
        <div className="pt-4 border-t">
          <AddChecklistItem
            checklistHash={checklistHash}
            onItemAdded={refreshItems}
          />
        </div>
      </div>
    </div>
  );
}
