import { describe, it, expect } from "vitest";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "@/lib/validation/inventory/product.schemas";

describe("Product Validation Schemas", () => {
  describe("CreateProductSchema", () => {
    it("should validate correct product data", () => {
      const validData = {
        sku: "SKU-001",
        name: "Test Product",
        description: "A test product",
        category: "Electronics",
        unitPrice: 99.99,
        reorderLevel: 10,
        isActive: true,
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate with optional fields", () => {
      const validData = {
        sku: "SKU-002",
        name: "Minimal Product",
        unitPrice: 50,
        reorderLevel: 5,
      };

      const result = CreateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty SKU", () => {
      const invalidData = {
        sku: "",
        name: "Test Product",
        unitPrice: 99.99,
        reorderLevel: 10,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject SKU exceeding max length", () => {
      const invalidData = {
        sku: "a".repeat(51), // More than 50 characters
        name: "Test Product",
        unitPrice: 99.99,
        reorderLevel: 10,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative unit price", () => {
      const invalidData = {
        sku: "SKU-001",
        name: "Test Product",
        unitPrice: -10,
        reorderLevel: 10,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("0 or greater");
      }
    });

    it("should reject negative reorder level", () => {
      const invalidData = {
        sku: "SKU-001",
        name: "Test Product",
        unitPrice: 99.99,
        reorderLevel: -5,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer reorder level", () => {
      const invalidData = {
        sku: "SKU-001",
        name: "Test Product",
        unitPrice: 99.99,
        reorderLevel: 10.5,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject description exceeding max length", () => {
      const invalidData = {
        sku: "SKU-001",
        name: "Test Product",
        description: "a".repeat(1001), // More than 1000 characters
        unitPrice: 99.99,
        reorderLevel: 10,
      };

      const result = CreateProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateProductSchema", () => {
    it("should validate correct update data", () => {
      const validData = {
        sku: "SKU-UPDATED",
        name: "Updated Product",
        unitPrice: 149.99,
        reorderLevel: 20,
      };

      const result = UpdateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
