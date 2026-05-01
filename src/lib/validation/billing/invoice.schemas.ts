import { z } from "zod";

const uuidField = (label: string) => z.string().uuid(`${label} must be a valid UUID`);

const moneyField = (label: string) =>
  z.coerce.number().min(0, `${label} must be 0 or greater`);

const percentageField = (label: string) =>
  z.coerce.number().min(0, `${label} must be 0 or greater`);

export const CreateInvoiceLineSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: moneyField("Unit price"),
  taxRate: percentageField("Tax rate"),
  discount: moneyField("Discount").optional().default(0),
});

export const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  customerId: uuidField("Customer"),
  orderId: z.string().uuid("Order must be a valid UUID").optional().nullable(),
  currency: z.string().trim().min(1, "Currency is required"),
  paymentTermsDays: z.coerce
    .number()
    .int("Payment terms must be a whole number")
    .min(0, "Payment terms must be 0 or greater")
    .optional()
    .default(30),
  lines: z.array(CreateInvoiceLineSchema).min(1, "At least one line is required"),
});

export const IssueInvoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  issueDate: z.string().datetime("Issue date must be a valid date-time"),
});

export const CancelInvoiceSchema = z.object({
  reason: z.string().trim().min(1, "Reason is required"),
});

export const RecordPaymentSchema = z.object({
  amount: moneyField("Amount").refine((value) => value > 0, {
    message: "Amount must be greater than 0",
  }),
  method: z.string().trim().min(1, "Payment method is required"),
  paidAt: z.string().datetime("Paid date must be a valid date-time"),
  externalPaymentId: z
    .string()
    .trim()
    .min(1, "External payment ID cannot be empty")
    .optional()
    .nullable(),
});

export const CreditNoteLineSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: moneyField("Unit price"),
  taxRate: percentageField("Tax rate"),
  discount: moneyField("Discount").optional().default(0),
});

export const CreateCreditNoteSchema = z.object({
  reason: z.string().trim().min(1, "Reason is required"),
  lines: z.array(CreditNoteLineSchema).min(1, "At least one line is required"),
});

export type CreateInvoiceFormData = z.infer<typeof CreateInvoiceSchema>;
export type IssueInvoiceFormData = z.infer<typeof IssueInvoiceSchema>;
export type CancelInvoiceFormData = z.infer<typeof CancelInvoiceSchema>;
export type RecordPaymentFormData = z.infer<typeof RecordPaymentSchema>;
export type CreateCreditNoteFormData = z.infer<typeof CreateCreditNoteSchema>;
