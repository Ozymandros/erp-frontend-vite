import { describe, it, expect } from "vitest";
import {
  SalesOrderLineSchema,
  CreateSalesOrderSchema,
  CreateQuoteSchema,
  ConfirmQuoteSchema,
} from "@/lib/validation/sales/sales-order.schemas";

describe("Sales Order Validation Schemas", () => {
  describe("SalesOrderLineSchema", () => {
    it("should validate correct order line data", () => {
      const validData = {
        productId: "product-123",
        quantity: 5,
        unitPrice: 99.99,
      };

      const result = SalesOrderLineSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject quantity less than 1", () => {
      const invalidData = {
        productId: "product-123",
        quantity: 0,
        unitPrice: 99.99,
      };

      const result = SalesOrderLineSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative unit price", () => {
      const invalidData = {
        productId: "product-123",
        quantity: 5,
        unitPrice: -10,
      };

      const result = SalesOrderLineSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("CreateSalesOrderSchema", () => {
    it("should validate correct sales order data", () => {
      const validData = {
        customerId: "customer-123",
        orderDate: "2024-01-01T00:00:00Z",
        orderLines: [
          {
            productId: "product-123",
            quantity: 5,
            unitPrice: 99.99,
          },
        ],
      };

      const result = CreateSalesOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty order lines", () => {
      const invalidData = {
        customerId: "customer-123",
        orderDate: "2024-01-01T00:00:00Z",
        orderLines: [],
      };

      const result = CreateSalesOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("At least one");
      }
    });
  });

  describe("CreateQuoteSchema", () => {
    it("should validate correct quote data", () => {
      const validData = {
        customerId: "customer-123",
        orderLines: [
          {
            productId: "product-123",
            quantity: 5,
            unitPrice: 99.99,
          },
        ],
        validUntil: "2024-12-31T23:59:59Z",
      };

      const result = CreateQuoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject missing validUntil", () => {
      const invalidData = {
        customerId: "customer-123",
        orderLines: [
          {
            productId: "product-123",
            quantity: 5,
            unitPrice: 99.99,
          },
        ],
        validUntil: "",
      };

      const result = CreateQuoteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("ConfirmQuoteSchema", () => {
    it("should validate correct confirm quote data", () => {
      const validData = {
        quoteId: "quote-123",
        confirmationDate: "2024-01-01T00:00:00Z",
      };

      const result = ConfirmQuoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
