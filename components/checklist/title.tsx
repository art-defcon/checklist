"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useAutoSave } from "@/hooks/use-auto-save";

interface ChecklistTitleProps {
  initialTitle: string;
  checklistHash: string;
  className?: string;
}

export function ChecklistTitle({
  initialTitle,
  checklistHash,
  className,
}: ChecklistTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-save implementation
  const { isSaving } = useAutoSave({
    data: title,
    onSave: async (newTitle) => {
      if (newTitle.trim() === "") {
        setTitle(initialTitle); // Revert to original if empty
        return;
      }
      
      try {
        const response = await fetch(`/api/checklists/${checklistHash}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          throw new Error("Failed to update title");
        }
      } catch (error) {
        console.error("Failed to save title:", error);
        // We could show a toast notification here
      }
    },
  });

  // Focus the input when double-clicking on the title
  const handleDoubleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <div 
      className={`relative ${className}`} 
      onDoubleClick={handleDoubleClick}
    >
      <Input
        ref={inputRef}
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="text-2xl sm:text-3xl font-bold tracking-tight py-4 px-3 bg-transparent border-none hover:bg-accent/10 focus:bg-background focus:ring-2 focus:ring-primary/50 rounded-lg transition-all duration-200"
        placeholder="Untitled Checklist"
        aria-label="Checklist Title"
      />
      
      {isSaving && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
          Saving...
        </div>
      )}
      
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Double-click to edit
      </div>
    </div>
  );
}