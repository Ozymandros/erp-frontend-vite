import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { PurchaseOrderDto, SupplierDto } from "@/types/api.types";
import { PurchaseOrderStatus } from "@/types/api.types";

vi.mock("@/api/services/purchase-orders.service", () => ({
  purchaseOrdersService: {
    getPurchaseOrderById: vi.fn(),
  },
}));

vi.mock("@/api/services/suppliers.service", () => ({
  suppliersService: {
    getSupplierById: vi.fn(),
  },
}));

vi.mock("@/hooks/use-permissions", () => ({
  usePermission: vi.fn(() => true),
}));

import { PurchaseOrderDetailPage } from "../purchase-order-detail";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";
import { suppliersService } from "@/api/services/suppliers.service";

const mockPurchaseOrder: PurchaseOrderDto = {
  id: "po-1",
  orderNumber: "PO-2024-001",
  supplierId: "supplier-1",
  orderDate: "2024-01-01T00:00:00Z",
  status: PurchaseOrderStatus.Pending,
  totalAmount: 2500.00,
  orderLines: [
    {
      id: "line-1",
      purchaseOrderId: "po-1",
      productId: "product-1",
      quantity: 5,
      unitPrice: 500.00,
      lineTotal: 2500.00,
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
    <MemoryRouter initialEntries={[`/purchasing/purchase-orders/${orderId}`]}>
      <Routes>
        <Route path="/purchasing/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PurchaseOrderDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(suppliersService.getSupplierById).mockResolvedValue(mockSupplier);
  });

  it("should render loading state initially", () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockImplementation(() => new Promise(() => {}));

    render(<TestWrapper />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should display purchase order details after loading", async () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockResolvedValue(mockPurchaseOrder);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/PO-2024-001/)).toBeInTheDocument();
    });

    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should handle error when purchase order not found", async () => {
    vi.mocked(purchaseOrdersService.getPurchaseOrderById).mockRejectedValue(new Error("Purchase order not found"));

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/purchase order not found/i)).toBeInTheDocument();
    });
  });
});
