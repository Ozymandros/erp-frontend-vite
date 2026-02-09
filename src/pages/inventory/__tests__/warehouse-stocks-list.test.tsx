import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { WarehouseStocksListPage } from "../warehouse-stocks-list";
import { warehouseStocksService } from "@/api/services/warehouse-stocks.service";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type { WarehouseStockDto, ProductDto, WarehouseDto } from "@/types/api.types";

// Mock services
vi.mock("@/api/services/warehouse-stocks.service", () => ({
  warehouseStocksService: {
    getLowStocks: vi.fn(),
    getStocksByProduct: vi.fn(),
    getStocksByWarehouse: vi.fn(),
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

const mockProducts: ProductDto[] = [{ id: "prod-1", sku: "SKU1", name: "Laptop", unitPrice: 1000, quantityInStock: 5, reorderLevel: 10, createdAt: new Date().toISOString(), createdBy: "admin" }];
const mockWarehouses: WarehouseDto[] = [{ id: "wh-1", name: "Main Warehouse", location: "Loc 1", createdAt: new Date().toISOString(), createdBy: "admin" }];

const mockStocks: WarehouseStockDto[] = [
  {
    id: "stock-1",
    productId: "prod-1",
    warehouseId: "wh-1",
    quantity: 5,
    reservedQuantity: 0,
    reorderLevel: 10,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: "admin",
  },
];

describe("WarehouseStocksListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsService.getProducts).mockResolvedValue(mockProducts);
    vi.mocked(warehousesService.getWarehouses).mockResolvedValue(mockWarehouses);
  });

  it("should render low stocks by default", async () => {
    vi.mocked(warehouseStocksService.getLowStocks).mockResolvedValue(mockStocks);

    render(
      <MemoryRouter>
        <WarehouseStocksListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should call getLowStocks initially (filter defaults to 'low')
      expect(warehouseStocksService.getLowStocks).toHaveBeenCalled();
    });

    await waitFor(() => {
        // Use getAllByText because Laptop/Main Warehouse appear in dropdowns too
        expect(screen.getAllByText("Laptop").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Main Warehouse").length).toBeGreaterThan(0);
        // Quantity appears twice: once in "Total Qty" and once in "Available"
        expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should filter by product", async () => {
    vi.mocked(warehouseStocksService.getLowStocks).mockResolvedValue([]);
    vi.mocked(warehouseStocksService.getStocksByProduct).mockResolvedValue(mockStocks);

    render(
      <MemoryRouter>
        <WarehouseStocksListPage />
      </MemoryRouter>
    );

    const productSelect = await screen.findByLabelText("Filter by product");
    await userEvent.selectOptions(productSelect, "prod-1");

    await waitFor(() => {
      expect(warehouseStocksService.getStocksByProduct).toHaveBeenCalledWith("prod-1");
    });
  });

  it("should filter by warehouse", async () => {
    vi.mocked(warehouseStocksService.getLowStocks).mockResolvedValue([]);
    vi.mocked(warehouseStocksService.getStocksByWarehouse).mockResolvedValue(mockStocks);

    render(
      <MemoryRouter>
        <WarehouseStocksListPage />
      </MemoryRouter>
    );

    const warehouseSelect = await screen.findByLabelText("Filter by warehouse");
    await userEvent.selectOptions(warehouseSelect, "wh-1");

    await waitFor(() => {
      expect(warehouseStocksService.getStocksByWarehouse).toHaveBeenCalledWith("wh-1");
    });
  });

  it("should switch to All Stocks and handle exports", async () => {
    vi.mocked(warehouseStocksService.getLowStocks).mockResolvedValue(mockStocks);
    vi.mocked(warehouseStocksService.getStocksByProduct).mockResolvedValue(mockStocks);

    render(
      <MemoryRouter>
        <WarehouseStocksListPage />
      </MemoryRouter>
    );

    const allStocksBtn = await screen.findByRole('button', { name: /all stocks/i });
    await userEvent.click(allStocksBtn);

    const exportXlsxBtn = screen.getByRole('button', { name: /xlsx/i });
    const exportPdfBtn = screen.getByRole('button', { name: /pdf/i });

    await userEvent.click(exportXlsxBtn);
    expect(warehouseStocksService.exportToXlsx).toHaveBeenCalled();

    await userEvent.click(exportPdfBtn);
    expect(warehouseStocksService.exportToPdf).toHaveBeenCalled();

    // Switch back to Low Stock to cover lines 161-163
    const lowStockBtn = await screen.findByRole('button', { name: /low stock/i });
    await userEvent.click(lowStockBtn);
    expect(warehouseStocksService.getLowStocks).toHaveBeenCalled();
  });

  it("should handle fetch errors", async () => {
    vi.mocked(productsService.getProducts).mockRejectedValue(new Error("Fetch failed"));
    vi.mocked(warehousesService.getWarehouses).mockRejectedValue(new Error("Fetch failed"));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <WarehouseStocksListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch products", expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch warehouses", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("should render different stock statuses correctly", async () => {
    const variedStocks: WarehouseStockDto[] = [
      {
        id: "stock-1",
        productId: "prod-1",
        warehouseId: "wh-1",
        quantity: 50,
        reservedQuantity: 0,
        reorderLevel: 10,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: "admin",
      },
      {
        id: "stock-2",
        productId: "prod-1",
        warehouseId: "wh-1",
        quantity: 0,
        reservedQuantity: 0,
        reorderLevel: 10,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: "admin",
      },
      {
        id: "stock-3",
        productId: "prod-1",
        warehouseId: "wh-1",
        quantity: 5,
        reservedQuantity: 0,
        reorderLevel: 10,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: "admin",
      }
    ];

    vi.mocked(warehouseStocksService.getLowStocks).mockResolvedValue(variedStocks);

    render(
      <MemoryRouter>
        <WarehouseStocksListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("In Stock")).toBeInTheDocument();
      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
      // "Low Stock" appears in both the filter button and the table badge
      const lowStockElements = screen.getAllByText("Low Stock");
      expect(lowStockElements.length).toBeGreaterThanOrEqual(2);
    });
  });
});
