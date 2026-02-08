import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { OrderDetailPage } from "../order-detail";
import { ordersService } from "@/api/services/orders.service";
import { customersService } from "@/api/services/customers.service";
import type { OrderDto, CustomerDto } from "@/types/api.types";
import { OrderStatus } from "@/types/api.types";

vi.mock("@/api/services/orders.service", () => ({
  ordersService: {
    getOrderById: vi.fn(),
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

const mockOrder: OrderDto = {
  id: "order-1",
  orderNumber: "ORD-2024-001",
  customerId: "customer-1",
  orderDate: "2024-01-01T00:00:00Z",
  status: "Processing" as OrderStatus,
  totalAmount: 1500.00,
  orderLines: [
    {
      productId: "product-1",
      quantity: 2,
      unitPrice: 500.00,
      totalPrice: 1000.00,
    },
    {
      productId: "product-2",
      quantity: 1,
      unitPrice: 500.00,
      totalPrice: 500.00,
    },
  ],
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockCustomer: CustomerDto = {
  id: "customer-1",
  name: "Acme Corp",
  email: "contact@acme.com",
  phoneNumber: "555-0100",
  address: "123 Main St",
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
};

function TestWrapper({ orderId = "order-1" }: { orderId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("OrderDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersService.getCustomerById).mockResolvedValue(mockCustomer);
  });

  it("should render loading state initially", () => {
    vi.mocked(ordersService.getOrderById).mockImplementation(() => new Promise(() => {}));

    render(<TestWrapper />);

    expect(screen.getByText(/Loading order details/i)).toBeInTheDocument();
  });

  it("should display order details after loading", async () => {
    vi.mocked(ordersService.getOrderById).mockResolvedValue(mockOrder);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/ORD-2024-001/)).toBeInTheDocument();
    });

    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("should display order lines", async () => {
    vi.mocked(ordersService.getOrderById).mockResolvedValue(mockOrder);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/ORD-2024-001/)).toBeInTheDocument();
    });

    // Should show 2 order lines (product-1, product-2)
    expect(screen.getAllByText(/product-/i)).toHaveLength(2);
  });

  it("should display total amount", async () => {
    vi.mocked(ordersService.getOrderById).mockResolvedValue(mockOrder);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/\$1500/)).toBeInTheDocument();
    });
  });

  it("should handle error when order not found", async () => {
    vi.mocked(ordersService.getOrderById).mockRejectedValue(new Error("Order not found"));

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/order not found/i)).toBeInTheDocument();
    });
  });

  it("should have back to orders link", async () => {
    vi.mocked(ordersService.getOrderById).mockResolvedValue(mockOrder);

    render(<TestWrapper />);

    await waitFor(() => {
      const backLink = screen.getByRole("link", { name: /back to orders/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", "/orders");
    });
  });
});
