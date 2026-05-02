import { describe, it, expect } from "vitest";
import { CreateSupplierSchema, UpdateSupplierSchema } from "../purchasing/supplier.schemas";

describe("Supplier Schemas", () => {
  describe("CreateSupplierSchema", () => {
    it("validates correct supplier data", () => {
      const data = {
        name: "Acme Supplies",
        email: "contact@acme.com",
        phone: "+1234567890",
        address: "123 Main St",
        city: "New York",
        country: "USA",
        postalCode: "10001",
        isActive: true,
      };
      expect(CreateSupplierSchema.parse(data)).toEqual(data);
    });

it("accepts optional fields as undefined", () => {
      const data = {
        name: "Acme Supplies",
        email: "contact@acme.com",
        phone: "+1234567890",
        address: "123 Main St",
      };
      const result = CreateSupplierSchema.parse(data);
      expect(result.name).toBe(data.name);
      expect(result.email).toBe(data.email);
      expect(result.isActive).toBe(true);
    });

    it("applies default isActive to true", () => {
      const data = {
        name: "Acme Supplies",
        email: "contact@acme.com",
      };
      const result = CreateSupplierSchema.parse(data);
      expect(result.isActive).toBe(true);
    });

    it("rejects missing required name", () => {
      const data = { email: "contact@acme.com" };
      expect(() => CreateSupplierSchema.parse(data)).toThrow();
    });

    it("rejects missing required email", () => {
      const data = { name: "Acme Supplies" };
      expect(() => CreateSupplierSchema.parse(data)).toThrow();
    });

    it("rejects name exceeding max length", () => {
      const data = {
        name: "a".repeat(256),
        email: "contact@acme.com",
      };
      expect(() => CreateSupplierSchema.parse(data)).toThrow();
    });

    it("rejects invalid email format", () => {
      const data = {
        name: "Acme Supplies",
        email: "invalid-email",
      };
      expect(() => CreateSupplierSchema.parse(data)).toThrow();
    });

    it("rejects address exceeding max length", () => {
      const data = {
        name: "Acme Supplies",
        email: "contact@acme.com",
        address: "a".repeat(501),
      };
      expect(() => CreateSupplierSchema.parse(data)).toThrow();
    });

    it("rejects city exceeding max length", () => {
      const data = {
        name: "Acme Supplies",
        email: "contact@acme.com",
        city: "a".repeat(101),
      };
      expect(() => CreateSupplierSchema.parse(data)).toThrow();
    });

    it("rejects country exceeding max length", () => {
      const data = {
        name: "Acme Supplies",
        email: "contact@acme.com",
        country: "a".repeat(101),
      };
      expect(() => CreateSupplierSchema.parse(data)).toThrow();
    });

    it("rejects postalCode exceeding max length", () => {
      const data = {
        name: "Acme Supplies",
        email: "contact@acme.com",
        postalCode: "a".repeat(21),
      };
      expect(() => CreateSupplierSchema.parse(data)).toThrow();
    });

    it("accepts false isActive", () => {
      const data = {
        name: "Acme Supplies",
        email: "contact@acme.com",
        isActive: false,
      };
      expect(CreateSupplierSchema.parse(data).isActive).toBe(false);
    });
  });

  describe("UpdateSupplierSchema", () => {
    it("validates correct update data", () => {
      const data = {
        name: "Updated Supplier",
        email: "new@acme.com",
        isActive: false,
      };
      expect(UpdateSupplierSchema.parse(data)).toEqual(data);
    });

it("has same validation as CreateSupplierSchema", () => {
      const validData = {
        name: "Test Supplier",
        email: "test@supplier.com",
        phone: "+1234567890",
        address: "Test Address",
      };
      const result = UpdateSupplierSchema.parse(validData);
      expect(result.name).toBe(validData.name);
      expect(result.email).toBe(validData.email);
      expect(result.isActive).toBe(true);
    });
  });
});