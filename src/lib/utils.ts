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
  if (!amount) return ""
  
  // Remove trailing zeros and decimal point if not needed
  // Implementation without regex to eliminate ReDoS risk (as flagged by SonarCloud)
  const formatted = amount.toFixed(2);
  const parts = formatted.split(".");
  const whole = parts[0];
  const decimal = parts[1];

  if (!decimal || decimal === "00") {
    return `$${whole}`;
  }

  if (decimal.endsWith("0")) {
    return `$${whole}.${decimal.charAt(0)}`;
  }

  return `$${whole}.${decimal}`;
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
