import { z } from "zod";

// Helper for optional string fields: converts empty strings to undefined
const optionalString = (maxLength: number, errorMessage: string) =>
  z.preprocess(
    val => {
      if (!val || (typeof val === "string" && val.trim() === "")) {
        return undefined;
      }
      return typeof val === "string" ? val.trim() : val;
    },
    z.union([z.string().max(maxLength, errorMessage), z.undefined()])
  );

export const PurchaseOrderLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
});

export const CreatePurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDeliveryDate: optionalString(100, "Expected delivery date must be less than 100 characters"),
  orderLines: z.array(PurchaseOrderLineSchema).min(1, "At least one order line is required"),
});

export const UpdatePurchaseOrderSchema = CreatePurchaseOrderSchema;

export const ApprovePurchaseOrderSchema = z.object({
  purchaseOrderId: z.string().min(1, "Purchase order ID is required"),
  approvedBy: z.string().min(1, "Approver is required"),
  approvalDate: z.string().min(1, "Approval date is required"),
});

export const ReceivePurchaseOrderSchema = z.object({
  purchaseOrderId: z.string().min(1, "Purchase order ID is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  receivedDate: z.string().min(1, "Received date is required"),
  receivedItems: z.array(
    z.object({
      productId: z.string().min(1, "Product is required"),
      quantity: z.number().int().min(1, "Quantity must be at least 1"),
      warehouseId: z.string().min(1, "Warehouse is required"),
    })
  ).min(1, "At least one received item is required"),
});

export type PurchaseOrderLineFormData = z.infer<typeof PurchaseOrderLineSchema>;
export type CreatePurchaseOrderFormData = z.infer<typeof CreatePurchaseOrderSchema>;
export type UpdatePurchaseOrderFormData = z.infer<typeof UpdatePurchaseOrderSchema>;
export type ApprovePurchaseOrderFormData = z.infer<typeof ApprovePurchaseOrderSchema>;
export type ReceivePurchaseOrderFormData = z.infer<typeof ReceivePurchaseOrderSchema>;
