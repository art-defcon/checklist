"use client";

import { useState, useEffect, useRef } from "react";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  saveOnUnmount?: boolean;
}

/**
 * A hook for automatically saving data with debouncing
 * 
 * @param options.data The data to be saved
 * @param options.onSave The function to call to save the data
 * @param options.delay The debounce delay in milliseconds (default: 1000ms)
 * @param options.saveOnUnmount Whether to save when the component unmounts (default: true)
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 1000,
  saveOnUnmount = true,
}: UseAutoSaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<T>(data);
  const [pendingSave, setPendingSave] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const unmountingRef = useRef(false);
  const saveInProgressRef = useRef(false);

  // Check if data has changed from the last saved data
  const hasChanges = JSON.stringify(data) !== JSON.stringify(lastSavedData);

  // Function to save the data
  const saveData = async () => {
    if (saveInProgressRef.current) {
      // If a save is already in progress, mark that we need to save again
      setPendingSave(true);
      return;
    }

    if (!hasChanges) {
      // No changes to save
      return;
    }

    try {
      setIsSaving(true);
      saveInProgressRef.current = true;
      await onSave(data);
      setLastSavedData(data);
      setPendingSave(false);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setPendingSave(true); // Mark that we need to retry
    } finally {
      setIsSaving(false);
      saveInProgressRef.current = false;
    }
  };

  // Debounced save effect
  useEffect(() => {
    if (hasChanges) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set a new timer
      timerRef.current = setTimeout(() => {
        saveData();
      }, delay);
    }

    // Cleanup on unmount or when effect reruns
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, hasChanges, delay]);

  // Effect to handle pending saves after a failed save
  useEffect(() => {
    if (pendingSave && !saveInProgressRef.current) {
      saveData();
    }
  }, [pendingSave]);

  // Save on unmount if needed
  useEffect(() => {
    return () => {
      unmountingRef.current = true;
      if (saveOnUnmount && hasChanges) {
        // Force immediate save on unmount
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        saveData();
      }
    };
  }, [saveOnUnmount, hasChanges]);

  // Function to force save immediately
  const save = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    saveData();
  };

  return {
    isSaving,
    hasChanges,
    save, // Method to force an immediate save
  };
}