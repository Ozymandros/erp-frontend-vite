import { z } from "zod";

export const ReserveStockSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  orderId: z.string().min(1, "Order ID is required"),
  expiresAt: z.string().optional(),
});

export const StockTransferSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  fromWarehouseId: z.string().min(1, "Source warehouse is required"),
  toWarehouseId: z.string().min(1, "Destination warehouse is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
});

export const StockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  adjustmentType: z.enum(["Increase", "Decrease", "Found", "Lost", "Damaged"], {
    required_error: "Adjustment type is required",
  }),
});

export type ReserveStockFormData = z.infer<typeof ReserveStockSchema>;
export type StockTransferFormData = z.infer<typeof StockTransferSchema>;
export type StockAdjustmentFormData = z.infer<typeof StockAdjustmentSchema>;
