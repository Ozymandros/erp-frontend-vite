import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { WarehouseDetailPage } from "../warehouse-detail";
import { warehousesService } from "@/api/services/warehouses.service";
import type { WarehouseDto } from "@/types/api.types";

vi.mock("@/api/services/warehouses.service", () => ({
  warehousesService: {
    getWarehouseById: vi.fn(),
  },
}));

const mockWarehouse: WarehouseDto = {
  id: "wh-1",
  name: "Main Warehouse",
  location: "Building A",
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2024-01-02T00:00:00Z",
  updatedBy: "admin",
};

function TestWrapper({ warehouseId = "wh-1" }: { warehouseId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/inventory/warehouses/${warehouseId}`]}>
      <Routes>
        <Route path="/inventory/warehouses/:id" element={<WarehouseDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("WarehouseDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(warehousesService.getWarehouseById).mockImplementation(() => new Promise(() => {}));

    render(<TestWrapper />);

    expect(screen.getByText(/Loading warehouse/i)).toBeInTheDocument();
  });

  it("should display warehouse details after loading", async () => {
    vi.mocked(warehousesService.getWarehouseById).mockResolvedValue(mockWarehouse);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Main Warehouse")).toBeInTheDocument();
    });

    expect(screen.getByText("Building A")).toBeInTheDocument();
  });

  it("should display warehouse without location", async () => {
    const whNoLocation = { ...mockWarehouse, location: "" };
    vi.mocked(warehousesService.getWarehouseById).mockResolvedValue(whNoLocation);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Main Warehouse")).toBeInTheDocument();
    });
  });

  it("should have Edit and Delete buttons", async () => {
    vi.mocked(warehousesService.getWarehouseById).mockResolvedValue(mockWarehouse);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Main Warehouse")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("should handle error when warehouse not found", async () => {
    vi.mocked(warehousesService.getWarehouseById).mockRejectedValue(new Error("Warehouse not found"));

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/warehouse not found/i)).toBeInTheDocument();
    });
  });

  it("should have back to warehouses link", async () => {
    vi.mocked(warehousesService.getWarehouseById).mockResolvedValue(mockWarehouse);

    render(<TestWrapper />);

    await waitFor(() => {
      const backLink = screen.getByRole("link", { name: /back to warehouses/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", "/inventory/warehouses");
    });
  });

  it("should open edit dialog when Edit clicked", async () => {
    vi.mocked(warehousesService.getWarehouseById).mockResolvedValue(mockWarehouse);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Main Warehouse")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
