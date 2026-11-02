import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  CreateSupplierInvoiceDto,
  SupplierInvoiceDto,
} from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { supplierInvoicesService } = await import(
  "@/api/services/supplier-invoices.service"
);

const baseInvoice: SupplierInvoiceDto = {
  id: "si-1",
  purchaseOrderId: "po-1",
  supplierId: "supplier-1",
  invoiceNumber: "SINV-001",
  invoiceDate: "2024-01-10",
  currency: "USD",
  totalAmount: 500,
  lines: [],
  createdAt: "2024-01-10",
  updatedAt: "2024-01-10",
};

describe("SupplierInvoicesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch supplier invoices", async () => {
    mockApiClient.get.mockResolvedValue([baseInvoice]);

    const result = await supplierInvoicesService.getSupplierInvoices();

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/supplier-invoices"
    );
    expect(result).toEqual([baseInvoice]);
  });

  it("should fetch supplier invoice by id", async () => {
    mockApiClient.get.mockResolvedValue(baseInvoice);

    const result = await supplierInvoicesService.getSupplierInvoiceById("si-1");

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/supplier-invoices/si-1"
    );
    expect(result).toEqual(baseInvoice);
  });

  it("should fetch supplier invoices by purchase order", async () => {
    mockApiClient.get.mockResolvedValue([baseInvoice]);

    const result =
      await supplierInvoicesService.getSupplierInvoicesByPurchaseOrder("po-1");

    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/billing/api/billing/supplier-invoices/by-purchase-order/po-1"
    );
    expect(result).toEqual([baseInvoice]);
  });

  it("should create supplier invoice", async () => {
    const payload: CreateSupplierInvoiceDto = {
      purchaseOrderId: "po-1",
      supplierId: "supplier-1",
      invoiceNumber: "SINV-002",
      invoiceDate: "2024-01-11",
      currency: "USD",
      lines: [{ description: "Item", quantity: 1, unitPrice: 100 }],
    };
    mockApiClient.post.mockResolvedValue(baseInvoice);

    const result = await supplierInvoicesService.createSupplierInvoice(payload);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/billing/api/billing/supplier-invoices",
      payload
    );
    expect(result).toEqual(baseInvoice);
  });
});
