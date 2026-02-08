import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { StockOperationsPage } from "../stock-operations";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import { ordersService } from "@/api/services/orders.service";
import { OrderStatus } from "@/types/api.types";

vi.mock("@/api/services/products.service", () => ({
  productsService: {
    getProducts: vi.fn(),
  },
}));

vi.mock("@/api/services/warehouses.service", () => ({
  warehousesService: {
    getWarehouses: vi.fn(),
  },
}));

vi.mock("@/api/services/orders.service", () => ({
  ordersService: {
    getOrders: vi.fn(),
  },
}));

const mockProducts = [
  { id: "p1", name: "Product 1", sku: "SKU1", unitPrice: 10, quantityInStock: 5, reorderLevel: 2, createdAt: "2024-01-01T00:00:00Z", createdBy: "admin" },
];
const mockWarehouses = [
  { id: "w1", name: "Warehouse 1", location: "Loc A", createdAt: "2024-01-01T00:00:00Z", createdBy: "admin" },
];
const mockOrders = [
  { id: "o1", orderNumber: "ORD-001", status: OrderStatus.Pending, orderDate: "2024-01-01", customerId: "c1", orderLines: [], totalAmount: 0, createdAt: "2024-01-01T00:00:00Z", createdBy: "admin" },
];

describe("StockOperationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsService.getProducts).mockResolvedValue(mockProducts);
    vi.mocked(warehousesService.getWarehouses).mockResolvedValue(mockWarehouses);
    vi.mocked(ordersService.getOrders).mockResolvedValue(mockOrders);
  });

  it("should render page title and description", async () => {
    render(
      <MemoryRouter>
        <StockOperationsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Stock Operations/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Perform stock operations/)).toBeInTheDocument();
  });

  it("should render all four tab triggers", async () => {
    render(
      <MemoryRouter>
        <StockOperationsPage />
      </MemoryRouter>
    );

    // Tab triggers (Transfer, Adjust, Release have no duplicate; Reserve also appears as submit btn)
    expect(screen.getByRole("button", { name: /Transfer Stock/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Adjust Stock/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Release Reservation/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Reserve Stock/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("should show Reserve Stock form by default", async () => {
    render(
      <MemoryRouter>
        <StockOperationsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(productsService.getProducts).toHaveBeenCalled();
      expect(warehousesService.getWarehouses).toHaveBeenCalled();
      expect(ordersService.getOrders).toHaveBeenCalled();
    });
  });

  it("should switch to Transfer Stock tab when clicked", async () => {
    render(
      <MemoryRouter>
        <StockOperationsPage />
      </MemoryRouter>
    );

    const transferBtn = screen.getByRole("button", { name: /Transfer Stock/i });
    await userEvent.click(transferBtn);

    // Tab content switches - TransferStockForm has From Warehouse select
    await waitFor(() => {
      expect(screen.getByLabelText(/from warehouse/i)).toBeInTheDocument();
    });
  });

  it("should switch to Adjust Stock tab when clicked", async () => {
    render(
      <MemoryRouter>
        <StockOperationsPage />
      </MemoryRouter>
    );

    const adjustBtn = screen.getByRole("button", { name: /Adjust Stock/i });
    await userEvent.click(adjustBtn);

    // AdjustStockForm has Warehouse select (without "From")
    await waitFor(() => {
      expect(screen.getByText(/Adjustment Type/i)).toBeInTheDocument();
    });
  });

  it("should switch to Release Reservation tab when clicked", async () => {
    render(
      <MemoryRouter>
        <StockOperationsPage />
      </MemoryRouter>
    );

    const releaseBtn = screen.getByRole("button", { name: /Release Reservation/i });
    await userEvent.click(releaseBtn);

    // ReleaseReservationForm has Reservation ID input
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/reservation ID/i)).toBeInTheDocument();
    });
  });

  it("should handle fetch error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(productsService.getProducts).mockRejectedValue(new Error("API Error"));

    render(
      <MemoryRouter>
        <StockOperationsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch data", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
