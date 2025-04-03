"use client";

import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { useAutoSave } from "@/hooks/use-auto-save";
import { ChecklistItem as ChecklistItemType } from "@/types";
import { toast } from "sonner";

interface ChecklistItemProps {
  item: ChecklistItemType;
  checklistHash: string;
  onDelete: (id: string) => void;
}

export function ChecklistItem({
  item,
  checklistHash,
  onDelete,
}: ChecklistItemProps) {
  const [text, setText] = useState(item.text);
  const [isChecked, setIsChecked] = useState(item.isChecked);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<number>(0);

  // Auto-save for text changes
  const { isSaving: isSavingText } = useAutoSave({
    data: text,
    onSave: async (newText) => {
      if (newText !== item.text) {
        await updateItem({ text: newText });
      }
    },
  });

  // Auto-save for checkbox changes
  const { isSaving: isSavingCheck } = useAutoSave({
    data: isChecked,
    onSave: async (checked) => {
      if (checked !== item.isChecked) {
        await updateItem({ isChecked: checked });
      }
    },
    // Save checkbox changes immediately
    delay: 0,
  });

  // Function to update the item
  const updateItem = async (data: Partial<ChecklistItemType>) => {
    try {
      const response = await fetch(`/api/checklists/${checklistHash}/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update item");
      }

      if (data.isChecked !== undefined) {
        toast.success(`Item marked as ${data.isChecked ? "complete" : "incomplete"}`);
      } else if (data.text !== undefined) {
        toast.success("Item updated successfully");
      }
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "An unexpected error occurred while updating the item"
      );
      // Revert state on error
      if (data.isChecked !== undefined) {
        setIsChecked(item.isChecked);
      }
      if (data.text !== undefined) {
        setText(item.text);
      }
    }
  };

  // Handle checkbox change
  const handleCheckChange = (checked: boolean) => {
    setIsChecked(checked);
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // Handle touch start for long press
  const handleTouchStart = () => {
    touchStartRef.current = Date.now();
    touchTimerRef.current = setTimeout(() => {
      setIsEditing(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 10);
    }, 500); // 500ms long press
  };

  // Handle touch end to cancel long press
  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
      }
    };
  }, []);

  // Handle saving on blur or key press
  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
    if (e.key === "Escape") {
      setText(item.text); // Revert to original on escape
      setIsEditing(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/checklists/${checklistHash}/items/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete item");
      }

      toast.success("Item deleted successfully");
      onDelete(item.id);
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "An unexpected error occurred while deleting the item"
      );
    }
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleCheckChange}
        disabled={isSavingCheck}
        className="size-5"
        aria-label={isChecked ? "Mark as incomplete" : "Mark as complete"}
        aria-busy={isSavingCheck}
      />
      
      <div 
        className="flex-grow min-w-0" 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <Input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="bg-white hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            placeholder="Item text"
            aria-label="Edit item text"
            aria-busy={isSavingText}
          />
        ) : (
          <div 
            className={`w-full py-2 px-2 transition-colors duration-200 ${
              isChecked 
                ? 'line-through text-gray-500' 
                : 'text-gray-800'
            }`}
            aria-checked={isChecked}
            role="checkbox"
          >
            {text}
            {isSavingText && (
              <span className="text-xs text-gray-500 ml-2 animate-pulse">
                Saving...
              </span>
            )}
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="size-8 opacity-70 hover:opacity-100 hover:bg-red-100 hover:text-destructive transition-colors duration-200"
        aria-label="Delete item"
      >
        <TrashIcon className="size-4" />
      </Button>
    </div>
  );
}