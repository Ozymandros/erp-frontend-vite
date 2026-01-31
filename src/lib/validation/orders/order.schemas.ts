import { z } from "zod";

export const OrderLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
});

export const CreateOrderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderDate: z.string().min(1, "Order date is required"),
  orderLines: z.array(OrderLineSchema).min(1, "At least one order line is required"),
});

export const UpdateOrderSchema = CreateOrderSchema;

export type OrderLineFormData = z.infer<typeof OrderLineSchema>;
export type CreateOrderFormData = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderFormData = z.infer<typeof UpdateOrderSchema>;
