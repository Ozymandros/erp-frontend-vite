import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { SalesOrderDto, CustomerDto } from "@/types/api.types";
import { SalesOrderStatus } from "@/types/api.types";

vi.mock("@/api/services/sales-orders.service", () => ({
  salesOrdersService: {
    getSalesOrderById: vi.fn(),
  },
}));

vi.mock("@/api/services/customers.service", () => ({
  customersService: {
    getCustomerById: vi.fn(),
  },
}));

vi.mock("@/hooks/use-permissions", () => ({
  usePermission: vi.fn(() => true),
}));

import { SalesOrderDetailPage } from "../sales-order-detail";
import { salesOrdersService } from "@/api/services/sales-orders.service";
import { customersService } from "@/api/services/customers.service";

const mockSalesOrder: SalesOrderDto = {
  id: "so-1",
  orderNumber: "SO-2024-001",
  customerId: "customer-1",
  orderDate: "2024-01-01T00:00:00Z",
  status: SalesOrderStatus.Processing,
  totalAmount: 3000.00,
  isQuote: false,
  orderLines: [
    {
      id: "line-1",
      salesOrderId: "so-1",
      productId: "product-1",
      quantity: 3,
      unitPrice: 1000.00,
      lineTotal: 3000.00,
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
    vi.mocked(customersService.getCustomerById).mockResolvedValue(mockCustomer);
  });

  it("should render loading state initially", () => {
    vi.mocked(salesOrdersService.getSalesOrderById).mockImplementation(() => new Promise(() => {}));

    render(<TestWrapper />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should display sales order details after loading", async () => {
    vi.mocked(salesOrdersService.getSalesOrderById).mockResolvedValue(mockSalesOrder);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/SO-2024-001/)).toBeInTheDocument();
    });

    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("should handle error when sales order not found", async () => {
    vi.mocked(salesOrdersService.getSalesOrderById).mockRejectedValue(new Error("Sales order not found"));

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/sales order not found/i)).toBeInTheDocument();
    });
  });
});
