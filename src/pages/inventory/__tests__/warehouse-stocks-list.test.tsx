import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { WarehouseStocksListPage } from "../warehouse-stocks-list";
import { warehouseStocksService } from "@/api/services/warehouse-stocks.service";
import { productsService } from "@/api/services/products.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type { WarehouseStockDto } from "@/types/api.types";

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

const mockProducts: any[] = [{ id: "prod-1", name: "Laptop" }];
const mockWarehouses: any[] = [{ id: "wh-1", name: "Main Warehouse" }];

const mockStocks: WarehouseStockDto[] = [
  {
    productId: "prod-1",
    warehouseId: "wh-1",
    quantity: 5,
    reorderLevel: 10,
    unitCost: 100,
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
        expect(screen.getByText("5")).toBeInTheDocument(); // Quantity
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
});
