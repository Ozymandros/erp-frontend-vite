import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreateSupplierInvoiceDialog } from "../create-supplier-invoice-dialog";
import { supplierInvoicesService } from "@/api/services/supplier-invoices.service";
import { productsService } from "@/api/services/products.service";
import type { PurchaseOrderDto } from "@/types/api.types";
import { PurchaseOrderStatus } from "@/types/api.types";

vi.mock("@/api/services/supplier-invoices.service", () => ({
  supplierInvoicesService: {
    createSupplierInvoice: vi.fn(),
  },
}));

vi.mock("@/api/services/products.service", () => ({
  productsService: {
    getProducts: vi.fn(),
  },
}));

const mockOrder: PurchaseOrderDto = {
  id: "po-1",
  orderNumber: "PO-001",
  supplierId: "supplier-1",
  status: PurchaseOrderStatus.Received,
  orderDate: "2024-01-01",
  totalAmount: 100,
  orderLines: [
    {
      id: "line-1",
      purchaseOrderId: "po-1",
      productId: "prod-1",
      quantity: 2,
      unitPrice: 50,
      lineTotal: 100,
      createdAt: "2024-01-01",
      createdBy: "admin",
    },
  ],
  createdAt: "2024-01-01",
  createdBy: "admin",
  updatedAt: "2024-01-01",
};

describe("CreateSupplierInvoiceDialog", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsService.getProducts).mockResolvedValue([
      {
        id: "prod-1",
        sku: "SKU-1",
        name: "Widget",
        unitPrice: 50,
        quantityInStock: 10,
        reorderLevel: 1,
        createdAt: "2024-01-01",
        createdBy: "admin",
      },
    ]);
  });

  it("prefills lines with product name and sku", async () => {
    render(
      <CreateSupplierInvoiceDialog
        open={true}
        order={mockOrder}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Widget (SKU-1)")).toBeInTheDocument();
    });
  });

  it("falls back to productId when products fail to load", async () => {
    vi.mocked(productsService.getProducts).mockRejectedValue(
      new Error("products unavailable")
    );

    render(
      <CreateSupplierInvoiceDialog
        open={true}
        order={mockOrder}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("prod-1")).toBeInTheDocument();
    });
  });

  it("submits supplier invoice payload", async () => {
    vi.mocked(supplierInvoicesService.createSupplierInvoice).mockResolvedValue(
      {} as never
    );

    render(
      <CreateSupplierInvoiceDialog
        open={true}
        order={mockOrder}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Widget (SKU-1)")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/invoice number/i), {
      target: { value: "SINV-100" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create invoice/i }));

    await waitFor(() => {
      expect(supplierInvoicesService.createSupplierInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          purchaseOrderId: "po-1",
          supplierId: "supplier-1",
          invoiceNumber: "SINV-100",
          lines: [
            expect.objectContaining({
              description: "Widget (SKU-1)",
              quantity: 2,
              unitPrice: 50,
            }),
          ],
        })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
