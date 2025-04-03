"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

interface CreateChecklistButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function CreateChecklistButton({
  className,
  variant = "default",
  size = "default",
  children = "Start New Checklist",
}: CreateChecklistButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateChecklist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/checklists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Untitled Checklist",
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create checklist";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            console.error("Error details:", errorData.details);
          }
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (!result?.hash) {
        throw new Error("Invalid response from server");
      }

      toast.success("Checklist created successfully");
      router.push(`/c/${result.hash}`);
    } catch (error) {
      console.error("Error creating checklist:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      onClick={handleCreateChecklist}
      disabled={isLoading}
    >
      <PlusIcon className="size-4" />
      {children}
    </Button>
  );
}