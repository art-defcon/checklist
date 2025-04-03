"use client";

import { Button } from "@/components/ui/button";
import { ShareIcon } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  className?: string;
}

export function ShareButton({ className }: ShareButtonProps) {
  const handleShare = async () => {
    // Get the current URL
    const url = window.location.href;

    try {
      // Try to use the clipboard API
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      // Fallback method using a temporary input element
      const tempInput = document.createElement("input");
      document.body.appendChild(tempInput);
      tempInput.value = url;
      tempInput.select();
      try {
        document.execCommand("copy");
        toast.success("Link copied to clipboard");
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
        toast.error("Failed to copy link. Please try again.");
      } finally {
        document.body.removeChild(tempInput);
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={`gap-2 bg-white text-gray-700 border-gray-300 ${className}`}
      aria-label="Share checklist"
    >
      <ShareIcon className="size-4" />
      <span>Share</span>
    </Button>
  );
}