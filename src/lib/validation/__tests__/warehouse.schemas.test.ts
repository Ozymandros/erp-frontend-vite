import { describe, it, expect } from "vitest";
import {
  CreateWarehouseSchema,
  UpdateWarehouseSchema,
} from "@/lib/validation/inventory/warehouse.schemas";

describe("Warehouse Validation Schemas", () => {
  describe("CreateWarehouseSchema", () => {
    it("should validate correct warehouse data", () => {
      const validData = {
        name: "Main Warehouse",
        location: "Building A",
      };

      const result = CreateWarehouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate with minimal required fields", () => {
      const validData = {
        name: "Warehouse",
        location: "Location",
      };

      const result = CreateWarehouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        location: "Location",
      };

      const result = CreateWarehouseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject name exceeding max length", () => {
      const invalidData = {
        name: "a".repeat(256), // More than 255 characters
        location: "Location",
      };

      const result = CreateWarehouseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateWarehouseSchema", () => {
    it("should validate correct update data", () => {
      const validData = {
        name: "Updated Warehouse",
        location: "New Location",
      };

      const result = UpdateWarehouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
