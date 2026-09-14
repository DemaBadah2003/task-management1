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

/**
 * Generates user initials according to the specification:
 * - Full name (2+ words): first char of first name + first char of last name (e.g. Mahmoud Taha -> MT)
 * - Single name: first two characters (e.g. Mahmoud -> MA)
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

