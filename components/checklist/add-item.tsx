"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface AddChecklistItemProps {
  checklistHash: string;
  onItemAdded: () => void;
}

export function AddChecklistItem({
  checklistHash,
  onItemAdded,
}: AddChecklistItemProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // Handle adding a new item
  const handleAddItem = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      // Focus the input if empty
      inputRef.current?.focus();
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/checklists/${checklistHash}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmedText }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      // Clear input after successful add
      setText("");
      // Focus the input for easy adding of multiple items
      inputRef.current?.focus();
      // Trigger callback to refresh items
      onItemAdded();
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press (enter to add)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleAddItem();
    }
    if (e.key === "Escape") {
      setText("");
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="Add a new item..."
        disabled={isLoading}
        className="flex-grow bg-white hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/30 border-gray-300 transition-all duration-200"
        autoComplete="off"
        aria-label="Add new checklist item"
        aria-busy={isLoading}
      />
      <Button
        onClick={handleAddItem}
        disabled={isLoading || !text.trim()}
        size="sm"
        className="shrink-0 gap-1 hover:bg-primary/90 transition-colors duration-200"
        aria-label="Add item"
        aria-disabled={isLoading || !text.trim()}
      >
        {isLoading ? (
          <div 
            className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        ) : (
          <PlusIcon className="size-4" aria-hidden="true" />
        )}
        <span>Add</span>
      </Button>
    </div>
  );
}