import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { PurchaseOrderDto, SupplierDto } from "@/types/api.types";
import {
  PurchaseOrderMatchStatus,
  PurchaseOrderStatus,
} from "@/types/api.types";

vi.mock("@/api/services/purchase-orders.service", () => ({
  purchaseOrdersService: {
    getPurchaseOrderById: vi.fn(),
    matchPurchaseOrder: vi.fn(),
    approvePurchaseOrder: vi.fn(),
    receivePurchaseOrder: vi.fn(),
  },
}));

vi.mock("@/api/services/supplier-invoices.service", () => ({
  supplierInvoicesService: {
    getSupplierInvoicesByPurchaseOrder: vi.fn(),
    createSupplierInvoice: vi.fn(),
  },
}));

vi.mock("@/api/services/warehouses.service", () => ({
  warehousesService: {
    getWarehouses: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(() => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  })),
}));

import { PurchaseOrderDetailPage } from "../purchase-order-detail";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";
import { supplierInvoicesService } from "@/api/services/supplier-invoices.service";

const mockPurchaseOrder: PurchaseOrderDto = {
  id: "po-1",
  orderNumber: "PO-2024-001",
  supplierId: "supplier-1",
  orderDate: "2024-01-01T00:00:00Z",
  status: PurchaseOrderStatus.Pending,
  totalAmount: 2500.0,
  orderLines: [
    {
      id: "line-1",
      purchaseOrderId: "po-1",
      productId: "product-1",
      quantity: 5,
      unitPrice: 500.0,
      lineTotal: 2500.0,
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "admin",
    },
  ],
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockSupplier: SupplierDto = {
  id: "supplier-1",
  name: "Tech Supplies Inc",
  email: "contact@techsupplies.com",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
};

function TestWrapper({ orderId = "po-1" }: { orderId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/purchasing/orders/${orderId}`]}>
      <Routes>
        <Route path="/purchasing/orders/:id" element={<PurchaseOrderDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PurchaseOrderDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supplierInvoicesService.getSupplierInvoicesByPurchaseOrder).mockResolvedValue(
      []
    );
  });

  it("should render loading state initially", () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockImplementation(
      () => new Promise(() => {})
    );

    render(<TestWrapper />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should display purchase order details after loading", async () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockResolvedValue({
      ...mockPurchaseOrder,
      supplier: mockSupplier,
    });

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/PO-2024-001/)).toBeInTheDocument();
    });

    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should handle error when purchase order not found", async () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockRejectedValue(
      new Error("Purchase order not found")
    );

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/purchase order not found/i)).toBeInTheDocument();
    });
  });

  it("should enable approve for pending orders", async () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.Pending,
      supplier: mockSupplier,
    });

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^approve$/i })).toBeEnabled();
    });
    expect(screen.getByRole("button", { name: /^receive$/i })).toBeDisabled();
  });

  it("should enable receive for approved orders", async () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.Approved,
      supplier: mockSupplier,
    });

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^receive$/i })).toBeEnabled();
    });
  });

  it("should list supplier invoices for the purchase order", async () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.Received,
      matchStatus: PurchaseOrderMatchStatus.Unmatched,
      supplier: mockSupplier,
    });
    vi.mocked(supplierInvoicesService.getSupplierInvoicesByPurchaseOrder).mockResolvedValue([
      {
        id: "si-1",
        purchaseOrderId: "po-1",
        supplierId: "supplier-1",
        invoiceNumber: "SINV-9",
        invoiceDate: "2024-01-10",
        currency: "USD",
        totalAmount: 2500,
        lines: [],
        createdAt: "2024-01-10",
        updatedAt: "2024-01-10",
      },
    ]);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("SINV-9")).toBeInTheDocument();
    });
  });

  it("should call match service when match is clicked", async () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockResolvedValue({
      ...mockPurchaseOrder,
      status: PurchaseOrderStatus.Received,
      matchStatus: PurchaseOrderMatchStatus.Unmatched,
    });
    vi.mocked(purchaseOrdersService.matchPurchaseOrder).mockResolvedValue({
      purchaseOrderId: "po-1",
      matchStatus: PurchaseOrderMatchStatus.Matched,
      summary: "All amounts match.",
    });

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^match$/i })).toBeEnabled();
    });

    await userEvent.click(screen.getByRole("button", { name: /^match$/i }));

    await waitFor(() => {
      expect(purchaseOrdersService.matchPurchaseOrder).toHaveBeenCalledWith("po-1");
      expect(screen.getByText("All amounts match.")).toBeInTheDocument();
    });
  });
});
