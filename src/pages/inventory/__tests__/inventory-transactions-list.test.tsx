import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { InventoryTransactionsListPage } from "../inventory-transactions-list";
import { inventoryTransactionsService } from "@/api/services/inventory-transactions.service";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type { InventoryTransactionDto, PaginatedResponse, ProductDto, WarehouseDto } from "@/types/api.types";
import { TransactionType } from "@/types/api.types";

// Mock services
vi.mock("@/api/services/inventory-transactions.service", () => ({
  inventoryTransactionsService: {
    searchTransactions: vi.fn(),
    getTransactionsByProduct: vi.fn(),
    getTransactionsByWarehouse: vi.fn(),
    getTransactionsByType: vi.fn(),
    exportToXlsx: vi.fn(),
    exportToPdf: vi.fn(),
  },
}));

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

// Mock permissions
vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(() => ({
    canExport: true,
  })),
}));

const mockProducts: any[] = [
  { id: "prod-1", name: "Laptop" },
  { id: "prod-2", name: "Mouse" },
];

const mockWarehouses: any[] = [
  { id: "wh-1", name: "Main Warehouse" },
];

const mockTransactions: InventoryTransactionDto[] = [
  {
    id: "txn-1",
    transactionType: TransactionType.Purchase,
    productId: "prod-1",
    warehouseId: "wh-1",
    quantity: 10,
    transactionDate: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "txn-2",
    transactionType: TransactionType.Sale,
    productId: "prod-1",
    warehouseId: "wh-1",
    quantity: -5,
    transactionDate: "2024-01-02T00:00:00Z",
    createdAt: "2024-01-02T00:00:00Z",
    createdBy: "system",
  },
];

const mockResponse: PaginatedResponse<InventoryTransactionDto> = {
  items: mockTransactions,
  total: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("InventoryTransactionsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsService.getProducts).mockResolvedValue(mockProducts);
    vi.mocked(warehousesService.getWarehouses).mockResolvedValue(mockWarehouses);
  });

  it("should render transactions list correctly with resolved names", async () => {
    vi.mocked(inventoryTransactionsService.searchTransactions).mockResolvedValue(mockResponse);

    render(
      <MemoryRouter>
        <InventoryTransactionsListPage />
      </MemoryRouter>
    );

    // Initial load calls searchTransactions
    await waitFor(() => {
      expect(inventoryTransactionsService.searchTransactions).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getAllByText("Laptop").length).toBeGreaterThan(0); // Resolved product name
      expect(screen.getAllByText("Main Warehouse").length).toBeGreaterThan(0); // Resolved warehouse name
      expect(screen.getAllByText("Purchase").length).toBeGreaterThan(0); // Type label
    });
  });

  it("should filter by product", async () => {
    vi.mocked(inventoryTransactionsService.searchTransactions).mockResolvedValue(mockResponse);
    vi.mocked(inventoryTransactionsService.getTransactionsByProduct).mockResolvedValue([mockTransactions[0]]);

    render(
      <MemoryRouter>
        <InventoryTransactionsListPage />
      </MemoryRouter>
    );

    // Wait for product options to load
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Laptop/ })).toBeInTheDocument();
    });

    const productSelect = screen.getByLabelText("Filter by product");
    await userEvent.selectOptions(productSelect, "prod-1");

    await waitFor(() => {
      expect(inventoryTransactionsService.getTransactionsByProduct).toHaveBeenCalledWith("prod-1");
    });
  });

  it("should filter by warehouse", async () => {
    vi.mocked(inventoryTransactionsService.searchTransactions).mockResolvedValue(mockResponse);
    vi.mocked(inventoryTransactionsService.getTransactionsByWarehouse).mockResolvedValue([mockTransactions[0]]);

    render(
      <MemoryRouter>
        <InventoryTransactionsListPage />
      </MemoryRouter>
    );

    // Wait for warehouse options to load
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Main Warehouse/ })).toBeInTheDocument();
    });

    const warehouseSelect = screen.getByLabelText("Filter by warehouse");
    await userEvent.selectOptions(warehouseSelect, "wh-1");

    await waitFor(() => {
      expect(inventoryTransactionsService.getTransactionsByWarehouse).toHaveBeenCalledWith("wh-1");
    });
  });

  it("should filter by type", async () => {
    vi.mocked(inventoryTransactionsService.searchTransactions).mockResolvedValue(mockResponse);
    vi.mocked(inventoryTransactionsService.getTransactionsByType).mockResolvedValue([mockTransactions[1]]);

    render(
      <MemoryRouter>
        <InventoryTransactionsListPage />
      </MemoryRouter>
    );

    const typeSelect = await screen.findByLabelText("Filter by type");
    await userEvent.selectOptions(typeSelect, TransactionType.Sale);

    await waitFor(() => {
      expect(inventoryTransactionsService.getTransactionsByType).toHaveBeenCalledWith(TransactionType.Sale);
    });
  });
});
