import { describe, expect, it } from "vitest";
import {
  CancelInvoiceSchema,
  CreateCreditNoteSchema,
  CreateInvoiceSchema,
  IssueInvoiceSchema,
  RecordPaymentSchema,
} from "../billing/invoice.schemas";

describe("CreateInvoiceSchema", () => {
  it("accepts valid invoice payload", () => {
    const result = CreateInvoiceSchema.safeParse({
      invoiceNumber: "INV-2026-001",
      customerId: "11111111-1111-4111-8111-111111111111",
      orderId: "22222222-2222-4222-8222-222222222222",
      currency: "EUR",
      paymentTermsDays: 45,
      lines: [
        {
          description: "Consulting services",
          quantity: 2,
          unitPrice: 100,
          taxRate: 21,
          discount: 10,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one line", () => {
    const result = CreateInvoiceSchema.safeParse({
      invoiceNumber: "INV-2026-001",
      customerId: "11111111-1111-4111-8111-111111111111",
      currency: "EUR",
      lines: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("IssueInvoiceSchema", () => {
  it("requires valid date-time", () => {
    const result = IssueInvoiceSchema.safeParse({
      invoiceNumber: "INV-001",
      issueDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});

describe("CancelInvoiceSchema", () => {
  it("requires reason", () => {
    const result = CancelInvoiceSchema.safeParse({ reason: "" });
    expect(result.success).toBe(false);
  });
});

describe("RecordPaymentSchema", () => {
  it("requires positive amount", () => {
    const result = RecordPaymentSchema.safeParse({
      amount: 0,
      method: "BankTransfer",
      paidAt: "2026-01-10T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateCreditNoteSchema", () => {
  it("accepts valid credit note", () => {
    const result = CreateCreditNoteSchema.safeParse({
      reason: "Returned goods",
      lines: [
        {
          description: "Returned item",
          quantity: 1,
          unitPrice: 50,
          taxRate: 21,
          discount: 0,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
