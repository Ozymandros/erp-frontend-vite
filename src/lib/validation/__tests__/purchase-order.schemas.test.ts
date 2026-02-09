import { describe, it, expect } from "vitest";
import {
  PurchaseOrderLineSchema,
  CreatePurchaseOrderSchema,
  ApprovePurchaseOrderSchema,
  ReceivePurchaseOrderSchema,
} from "@/lib/validation/purchasing/purchase-order.schemas";

describe("Purchase Order Validation Schemas", () => {
  describe("PurchaseOrderLineSchema", () => {
    it("should validate correct order line data", () => {
      const validData = {
        productId: "product-123",
        quantity: 10,
        unitPrice: 49.99,
      };

      const result = PurchaseOrderLineSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject quantity less than 1", () => {
      const invalidData = {
        productId: "product-123",
        quantity: 0,
        unitPrice: 49.99,
      };

      const result = PurchaseOrderLineSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("CreatePurchaseOrderSchema", () => {
    it("should validate correct purchase order data", () => {
      const validData = {
        supplierId: "supplier-123",
        orderDate: "2024-01-01T00:00:00Z",
        expectedDeliveryDate: "2024-01-15T00:00:00Z",
        orderLines: [
          {
            productId: "product-123",
            quantity: 10,
            unitPrice: 49.99,
          },
        ],
      };

      const result = CreatePurchaseOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate without optional expectedDeliveryDate", () => {
      const validData = {
        supplierId: "supplier-123",
        orderDate: "2024-01-01T00:00:00Z",
        orderLines: [
          {
            productId: "product-123",
            quantity: 10,
            unitPrice: 49.99,
          },
        ],
      };

      const result = CreatePurchaseOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty order lines", () => {
      const invalidData = {
        supplierId: "supplier-123",
        orderDate: "2024-01-01T00:00:00Z",
        orderLines: [],
      };

      const result = CreatePurchaseOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("ApprovePurchaseOrderSchema", () => {
    it("should validate correct approval data", () => {
      const validData = {
        purchaseOrderId: "po-123",
        approvedBy: "user-123",
        approvalDate: "2024-01-01T00:00:00Z",
      };

      const result = ApprovePurchaseOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("ReceivePurchaseOrderSchema", () => {
    it("should validate correct receive data", () => {
      const validData = {
        purchaseOrderId: "po-123",
        warehouseId: "warehouse-123",
        receivedDate: "2024-01-15T00:00:00Z",
        receivedItems: [
          {
            productId: "product-123",
            quantity: 10,
            warehouseId: "warehouse-123",
          },
        ],
      };

      const result = ReceivePurchaseOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty received items", () => {
      const invalidData = {
        purchaseOrderId: "po-123",
        warehouseId: "warehouse-123",
        receivedDate: "2024-01-15T00:00:00Z",
        receivedItems: [],
      };

      const result = ReceivePurchaseOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
