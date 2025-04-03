import crypto from "crypto";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Function to generate a random hash of specified length
export function generateUniqueHash(length: number = 8): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
