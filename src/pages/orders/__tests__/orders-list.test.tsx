import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { OrdersListPage } from "../orders-list";
import { ordersService } from "@/api/services/orders.service";
import { customersService } from "@/api/services/customers.service";
import type { OrderDto, CustomerDto } from "@/types/api.types";
import { OrderStatus } from "@/types/api.types";

// Mock services
vi.mock("@/api/services/orders.service", () => ({
  ordersService: {
    getOrders: vi.fn(),
    exportToXlsx: vi.fn(),
    exportToPdf: vi.fn(),
  },
}));

vi.mock("@/api/services/customers.service", () => ({
  customersService: {
    getCustomers: vi.fn(),
  },
}));

// Mock permissions
vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(() => ({
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  })),
}));

// Mock dialogs
vi.mock("@/components/orders/create-order-dialog", () => ({
  CreateOrderDialog: ({ open, onSuccess }: any) => 
    open ? <div role="dialog">Create Order Dialog <button onClick={() => onSuccess?.()}>Create</button></div> : null,
}));

const mockCustomers: CustomerDto[] = [
  {
    id: "cust-1",
    name: "John's Shop",
    email: "john@shop.com",
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

const mockOrders: OrderDto[] = [
  {
    id: "order-1",
    orderNumber: "ORD-001",
    status: OrderStatus.Pending,
    customerId: "cust-1",
    orderDate: "2024-01-01T00:00:00Z",
    orderLines: [],
    totalAmount: 100,
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "order-2",
    orderNumber: "ORD-002",
    status: OrderStatus.Processing,
    customerId: "unknown",
    orderDate: "2024-01-02T00:00:00Z",
    orderLines: [],
    totalAmount: 200,
    createdAt: "2024-01-02T00:00:00Z",
    createdBy: "system",
  },
];

describe("OrdersListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersService.getCustomers).mockResolvedValue(mockCustomers);
  });

  it("should render orders list correctly", async () => {
    vi.mocked(ordersService.getOrders).mockResolvedValue(mockOrders);

    render(
      <MemoryRouter>
        <OrdersListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("ORD-001")).toBeInTheDocument();
      expect(screen.getByText("ORD-002")).toBeInTheDocument();
    });

    // Check customer resolution
    expect(screen.getByText("John's Shop")).toBeInTheDocument();
    // Status badges
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("should handle empty state", async () => {
    vi.mocked(ordersService.getOrders).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <OrdersListPage />
      </MemoryRouter>
    );

    // Wait for loading to finish and "No order found." to appear
    // Checked component: <ListPageLayout resourceName="Order" ...>
    // So expect: "No order found."
    await waitFor(() => {
      expect(screen.getByText("No order found.")).toBeInTheDocument();
    });
  });

  it("should open create dialog when add button is clicked", async () => {
    vi.mocked(ordersService.getOrders).mockResolvedValue(mockOrders);

    render(
      <MemoryRouter>
        <OrdersListPage />
      </MemoryRouter>
    );

    const addButton = await screen.findByRole("button", { name: /add order/i });
    expect(addButton).toBeInTheDocument();

    await userEvent.click(addButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create Order Dialog")).toBeInTheDocument();
  });
});
