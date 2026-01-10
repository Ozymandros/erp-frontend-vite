import { z } from "zod";

export const SalesOrderLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
});

export const CreateSalesOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderDate: z.string().min(1, "Order date is required"),
  orderLines: z
    .array(SalesOrderLineSchema)
    .min(1, "At least one order line is required"),
});

export const UpdateSalesOrderSchema = CreateSalesOrderSchema;

export const CreateQuoteSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderLines: z
    .array(SalesOrderLineSchema)
    .min(1, "At least one order line is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
});

export const ConfirmQuoteSchema = z.object({
  quoteId: z.string().min(1, "Quote ID is required"),
  confirmationDate: z.string().min(1, "Confirmation date is required"),
});

export type SalesOrderLineFormData = z.infer<typeof SalesOrderLineSchema>;
export type CreateSalesOrderFormData = z.infer<typeof CreateSalesOrderSchema>;
export type UpdateSalesOrderFormData = z.infer<typeof UpdateSalesOrderSchema>;
export type CreateQuoteFormData = z.infer<typeof CreateQuoteSchema>;
export type ConfirmQuoteFormData = z.infer<typeof ConfirmQuoteSchema>;
