import { describe, it, expect } from "vitest";
import { cn, formatDateTime, formatDate, formatCurrency } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });

    it("should handle undefined and null", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("should handle empty strings", () => {
      expect(cn("foo", "", "bar")).toBe("foo bar");
    });
  });

  describe("formatDate", () => {
    it("should format ISO date string", () => {
      const dateStr = "2024-01-15T10:30:00Z";
      const formatted = formatDate(dateStr);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("2024");
    });

    it("should return empty string for undefined", () => {
      const formatted = formatDate(undefined);
      expect(formatted).toBe("");
    });

    it("should handle Date object", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2024");
    });
  });

  describe("formatDateTime", () => {
    it("should format ISO date string with time", () => {
      const dateStr = "2024-01-15T10:30:00Z";
      const formatted = formatDateTime(dateStr);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("2024");
    });

    it("should handle different date formats", () => {
      const dateStr = "2024-12-31T23:59:59.000Z";
      const formatted = formatDateTime(dateStr);
      expect(formatted).toBeTruthy();
    });

    it("should return empty string for undefined", () => {
      const formatted = formatDateTime(undefined);
      expect(formatted).toBe("");
    });

    it("should handle Date object", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const formatted = formatDateTime(date);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain("2024");
    });
  });

  describe("formatCurrency", () => {
    it("should return empty string for zero", () => {
      expect(formatCurrency(0)).toBe("");
    });

    it("should format whole numbers without decimals", () => {
      expect(formatCurrency(15000)).toBe("$15000");
      expect(formatCurrency(100)).toBe("$100");
    });

    it("should format amounts with one decimal place when trailing zero", () => {
      expect(formatCurrency(15000.5)).toBe("$15000.5");
      expect(formatCurrency(10.1)).toBe("$10.1");
    });

    it("should format amounts with two decimal places", () => {
      expect(formatCurrency(15000.99)).toBe("$15000.99");
      expect(formatCurrency(10.23)).toBe("$10.23");
    });

    it("should handle decimal.endsWith('0') branch", () => {
      expect(formatCurrency(10.1)).toBe("$10.1");
      expect(formatCurrency(99.9)).toBe("$99.9");
    });
  });
});
