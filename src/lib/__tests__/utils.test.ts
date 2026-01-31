import { describe, it, expect } from "vitest";
import { cn, formatDateTime, formatDate, getDefaultDateTimeLocal } from "@/lib/utils";

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

  describe("getDefaultDateTimeLocal", () => {
    it("returns datetime-local format YYYY-MM-DDTHH:mm", () => {
      const result = getDefaultDateTimeLocal();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
  });
});
