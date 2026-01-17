import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date?: string | Date): string {
  if (!date) return ""

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Formats a number as currency without zero fractions.
 * Example: 15000.00 -> "$15000", 15000.50 -> "$15000.5", 15000.99 -> "$15000.99"
 */
export function formatCurrency(amount: number): string {
  // Remove trailing zeros and decimal point if not needed
  const formatted = amount.toFixed(2).replace(/\.?0+$/, "");
  return `$${formatted}`;
}

export function formatDateTime(date?: string | Date): string {
  if (!date) return ""

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
