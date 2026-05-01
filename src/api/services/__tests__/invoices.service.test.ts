import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CancelInvoiceRequest,
  CreateCreditNoteDto,
  CreateInvoiceDto,
  CreditNoteDto,
  InvoiceDto,
  IssueInvoiceRequest,
  PaginatedResponse,
  PaymentDto,
  QuerySpec,
  RecordPaymentDto,
} from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const baseInvoice: InvoiceDto = {
  id: "inv-1",
  invoiceNumber: "INV-2026-001",
  customerId: "cust-1",
  orderId: "ord-1",
  currency: "EUR",
  status: "Draft",
  issueDate: "2026-01-01T00:00:00Z",
  dueDate: "2026-01-31T00:00:00Z",
  totalNet: 100,
  totalTax: 21,
  totalGross: 121,
  outstandingAmount: 121,
  lines: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const { invoicesService } = await import("@/api/services/invoices.service");

describe("InvoicesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches invoices", async () => {
    mockApiClient.get.mockResolvedValue([baseInvoice]);

    const result = await invoicesService.getInvoices();

    expect(mockApiClient.get).toHaveBeenCalledWith("/billing/api/billing/Invoices");
    expect(result).toEqual([baseInvoice]);
  });

  it("searches invoices with query spec", async () => {
    const querySpec: QuerySpec = {
      page: 1,
      pageSize: 20,
      searchTerm: "draft",
      searchFields: "invoiceNumber,status",
      sortBy: "createdAt",
      sortDesc: true,
      filters: { status: "Draft" },
    };
    const response: PaginatedResponse<InvoiceDto> = {
      items: [baseInvoice],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    mockApiClient.get.mockResolvedValue(response);

    const result = await invoicesService.searchInvoices(querySpec);

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/search",
      { params: querySpec }
    );
    expect(result).toEqual(response);
  });

  it("fetches invoice by id", async () => {
    mockApiClient.get.mockResolvedValue(baseInvoice);

    const result = await invoicesService.getInvoiceById("inv-1");

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/inv-1"
    );
    expect(result).toEqual(baseInvoice);
  });

  it("fetches invoices by customer", async () => {
    mockApiClient.get.mockResolvedValue([baseInvoice]);

    await invoicesService.getInvoicesByCustomer("cust-1");

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/customer/cust-1"
    );
  });

  it("fetches invoices by order", async () => {
    mockApiClient.get.mockResolvedValue([baseInvoice]);

    await invoicesService.getInvoicesByOrder("ord-1");

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/order/ord-1"
    );
  });

  it("creates invoice", async () => {
    const payload: CreateInvoiceDto = {
      invoiceNumber: "INV-2026-001",
      customerId: "cust-1",
      orderId: "ord-1",
      currency: "EUR",
      paymentTermsDays: 30,
      lines: [
        {
          description: "Line 1",
          quantity: 1,
          unitPrice: 100,
          taxRate: 21,
          discount: 0,
        },
      ],
    };
    mockApiClient.post.mockResolvedValue(baseInvoice);

    await invoicesService.createInvoice(payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices",
      payload
    );
  });

  it("issues invoice", async () => {
    const payload: IssueInvoiceRequest = {
      invoiceNumber: "INV-2026-001",
      issueDate: "2026-01-01T00:00:00Z",
    };
    mockApiClient.post.mockResolvedValue({ ...baseInvoice, status: "Issued" });

    await invoicesService.issueInvoice("inv-1", payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/inv-1/issue",
      payload
    );
  });

  it("records invoice payment", async () => {
    const payload: RecordPaymentDto = {
      amount: 50,
      method: "BankTransfer",
      paidAt: "2026-01-10T00:00:00Z",
      externalPaymentId: null,
    };
    mockApiClient.post.mockResolvedValue({
      ...baseInvoice,
      outstandingAmount: 71,
    });

    await invoicesService.recordPayment("inv-1", payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/inv-1/payments",
      payload
    );
  });

  it("cancels invoice", async () => {
    const payload: CancelInvoiceRequest = { reason: "Customer requested cancel" };
    mockApiClient.post.mockResolvedValue({ ...baseInvoice, status: "Cancelled" });

    await invoicesService.cancelInvoice("inv-1", payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/inv-1/cancel",
      payload
    );
  });

  it("creates credit note for invoice", async () => {
    const payload: CreateCreditNoteDto = {
      reason: "Return",
      lines: [
        {
          description: "Returned item",
          quantity: 1,
          unitPrice: 20,
          taxRate: 21,
          discount: 0,
        },
      ],
    };
    const creditNote: CreditNoteDto = {
      id: "cn-1",
      originalInvoiceId: "inv-1",
      reason: "Return",
      status: "Issued",
      totalNet: 20,
      totalTax: 4.2,
      totalGross: 24.2,
      createdAt: "2026-01-20T00:00:00Z",
    };
    mockApiClient.post.mockResolvedValue(creditNote);

    await invoicesService.createCreditNote("inv-1", payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/inv-1/credit-notes",
      payload
    );
  });

  it("fetches payments by invoice", async () => {
    const payments: PaymentDto[] = [
      {
        id: "pay-1",
        invoiceId: "inv-1",
        amount: 50,
        currency: "EUR",
        method: "BankTransfer",
        status: "Completed",
        paidAt: "2026-01-10T00:00:00Z",
      },
    ];
    mockApiClient.get.mockResolvedValue(payments);

    const result = await invoicesService.getPaymentsByInvoice("inv-1");

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/Payments/invoice/inv-1"
    );
    expect(result).toEqual(payments);
  });

  it("fetches credit notes by invoice", async () => {
    const creditNotes: CreditNoteDto[] = [
      {
        id: "cn-1",
        originalInvoiceId: "inv-1",
        reason: "Correction",
        status: "Issued",
        totalNet: 10,
        totalTax: 2.1,
        totalGross: 12.1,
        createdAt: "2026-01-20T00:00:00Z",
      },
    ];
    mockApiClient.get.mockResolvedValue(creditNotes);

    const result = await invoicesService.getCreditNotesByInvoice("inv-1");

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/credit-notes/invoice/inv-1"
    );
    expect(result).toEqual(creditNotes);
  });

  it("exports invoices to xlsx", async () => {
    const blob = new Blob(["xlsx"], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    mockApiClient.get.mockResolvedValue(blob);

    const result = await invoicesService.exportToXlsx();

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/export-xlsx",
      { responseType: "blob" }
    );
    expect(result).toBe(blob);
  });

  it("exports invoices to pdf", async () => {
    const blob = new Blob(["pdf"], { type: "application/pdf" });
    mockApiClient.get.mockResolvedValue(blob);

    const result = await invoicesService.exportToPdf();

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/Invoices/export-pdf",
      { responseType: "blob" }
    );
    expect(result).toBe(blob);
  });

  it("propagates service errors", async () => {
    const apiError = new Error("API failure");
    mockApiClient.get.mockRejectedValue(apiError);

    await expect(invoicesService.getInvoices()).rejects.toThrow("API failure");
  });
});
