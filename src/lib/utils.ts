import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names (clsx) and resolves conflicting
 * Tailwind utility classes (tailwind-merge). Use this instead of ever
 * concatenating className strings by hand.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
