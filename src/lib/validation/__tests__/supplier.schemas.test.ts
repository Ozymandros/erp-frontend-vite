import { describe, it, expect } from "vitest";
import { CreateSupplierSchema } from "../purchasing/supplier.schemas";

describe("CreateSupplierSchema", () => {
  it("validates a valid supplier", () => {
    const result = CreateSupplierSchema.safeParse({
      name: "Test Supplier",
      email: "supplier@example.com",
      phone: "(555) 123-4567",
      address: "123 Main St",
      city: "New York",
      country: "USA",
      postalCode: "10001",
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("requires name", () => {
    const result = CreateSupplierSchema.safeParse({
      name: "",
      email: "supplier@example.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("name"))).toBe(true);
    }
  });

  it("requires valid email", () => {
    const result = CreateSupplierSchema.safeParse({
      name: "Test Supplier",
      email: "invalid-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes("email"))).toBe(true);
    }
  });

  it("validates email format with pipe", () => {
    const result = CreateSupplierSchema.safeParse({
      name: "Test Supplier",
      email: "valid@email.com",
    });
    expect(result.success).toBe(true);
  });

  it("allows optional fields to be undefined", () => {
    const result = CreateSupplierSchema.safeParse({
      name: "Test Supplier",
      email: "supplier@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("allows empty optional fields to become undefined", () => {
    const result = CreateSupplierSchema.safeParse({
      name: "Test Supplier",
      email: "supplier@example.com",
      address: "",
      city: "",
      country: "",
      postalCode: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address).toBeUndefined();
      expect(result.data.city).toBeUndefined();
      expect(result.data.country).toBeUndefined();
      expect(result.data.postalCode).toBeUndefined();
    }
  });

  it("defaults isActive to true if not provided", () => {
    const result = CreateSupplierSchema.safeParse({
      name: "Test Supplier",
      email: "supplier@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });

  it("enforces max length on name", () => {
    const result = CreateSupplierSchema.safeParse({
      name: "a".repeat(256),
      email: "supplier@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("enforces max length on email", () => {
    const result = CreateSupplierSchema.safeParse({
      name: "Test Supplier",
      email: "a".repeat(250) + "@example.com",
    });
    expect(result.success).toBe(false);
  });
});
