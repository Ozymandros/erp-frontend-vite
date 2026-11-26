import { z } from "zod";

export const SupplierInvoiceLineSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
});

export const CreateSupplierInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  currency: z.string().min(1, "Currency is required"),
  lines: z
    .array(SupplierInvoiceLineSchema)
    .min(1, "At least one line is required"),
});

export type SupplierInvoiceLineFormData = z.infer<typeof SupplierInvoiceLineSchema>;
export type CreateSupplierInvoiceFormData = z.infer<typeof CreateSupplierInvoiceSchema>;
