import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { SalesOrderDto, CustomerDto } from "@/types/api.types";
import { SalesOrderStatus } from "@/types/api.types";

vi.mock("@/api/services/sales-orders.service", () => ({
  salesOrdersService: {
    getSalesOrderById: vi.fn(),
    createReturn: vi.fn(),
  },
}));

vi.mock("@/api/services/invoices.service", () => ({
  invoicesService: {
    getInvoicesByOrder: vi.fn(),
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

import { SalesOrderDetailPage } from "../sales-order-detail";
import { salesOrdersService } from "@/api/services/sales-orders.service";
import { invoicesService } from "@/api/services/invoices.service";

const mockSalesOrder: SalesOrderDto = {
  id: "so-1",
  orderNumber: "SO-2024-001",
  customerId: "customer-1",
  orderDate: "2024-01-01T00:00:00Z",
  status: SalesOrderStatus.Processing,
  totalAmount: 3000.0,
  isQuote: false,
  lines: [
    {
      id: "line-1",
      salesOrderId: "so-1",
      productId: "product-1",
      quantity: 3,
      unitPrice: 1000.0,
      lineTotal: 3000.0,
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "admin",
    },
  ],
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockCustomer: CustomerDto = {
  id: "customer-1",
  name: "Premium Customer Ltd",
  email: "contact@premiumcustomer.com",
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
};

function TestWrapper({ orderId = "so-1" }: { orderId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/sales/orders/${orderId}`]}>
      <Routes>
        <Route path="/sales/orders/:id" element={<SalesOrderDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SalesOrderDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invoicesService.getInvoicesByOrder).mockResolvedValue([]);
  });

  it("should render loading state initially", () => {
    vi.mocked(salesOrdersService.getSalesOrderById).mockImplementation(
      () => new Promise(() => {})
    );

    render(<TestWrapper />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should display sales order details after loading", async () => {
    vi.mocked(salesOrdersService.getSalesOrderById).mockResolvedValue({
      ...mockSalesOrder,
      customer: mockCustomer,
    });

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/SO-2024-001/)).toBeInTheDocument();
    });

    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("should handle error when sales order not found", async () => {
    vi.mocked(salesOrdersService.getSalesOrderById).mockRejectedValue(
      new Error("Sales order not found")
    );

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/sales order not found/i)).toBeInTheDocument();
    });
  });

  it("should enable create return for shipped orders", async () => {
    vi.mocked(salesOrdersService.getSalesOrderById).mockResolvedValue({
      ...mockSalesOrder,
      status: SalesOrderStatus.Shipped,
    });

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create return/i })).toBeEnabled();
    });
  });

  it("should disable create return for draft orders", async () => {
    vi.mocked(salesOrdersService.getSalesOrderById).mockResolvedValue({
      ...mockSalesOrder,
      status: SalesOrderStatus.Draft,
    });

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create return/i })).toBeDisabled();
    });
  });

  it("should list linked invoices", async () => {
    vi.mocked(salesOrdersService.getSalesOrderById).mockResolvedValue(mockSalesOrder);
    vi.mocked(invoicesService.getInvoicesByOrder).mockResolvedValue([
      {
        id: "inv-1",
        invoiceNumber: "INV-100",
        customerId: "customer-1",
        orderId: "so-1",
        currency: "USD",
        status: "Issued",
        issueDate: "2024-01-02",
        dueDate: "2024-02-02",
        totalNet: 100,
        totalTax: 0,
        totalGross: 100,
        outstandingAmount: 100,
        lines: [],
        createdAt: "2024-01-02",
        updatedAt: "2024-01-02",
      },
    ]);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("INV-100")).toBeInTheDocument();
    });
  });
});
