import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreateSalesReturnDialog } from "../create-sales-return-dialog";
import { salesOrdersService } from "@/api/services/sales-orders.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type { SalesOrderDto } from "@/types/api.types";
import { SalesOrderStatus } from "@/types/api.types";

vi.mock("@/api/services/sales-orders.service", () => ({
  salesOrdersService: {
    createReturn: vi.fn(),
  },
}));

vi.mock("@/api/services/warehouses.service", () => ({
  warehousesService: {
    getWarehouses: vi.fn(),
  },
}));

const mockOrder: SalesOrderDto = {
  id: "so-1",
  orderNumber: "SO-001",
  customerId: "c-1",
  status: SalesOrderStatus.Shipped,
  orderDate: "2024-01-01",
  totalAmount: 100,
  isQuote: false,
  lines: [
    {
      id: "line-1",
      salesOrderId: "so-1",
      productId: "prod-1",
      quantity: 2,
      unitPrice: 50,
      lineTotal: 100,
      createdAt: "2024-01-01",
      createdBy: "admin",
    },
  ],
  createdAt: "2024-01-01",
  createdBy: "admin",
  updatedAt: "2024-01-01",
};

describe("CreateSalesReturnDialog", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(warehousesService.getWarehouses).mockResolvedValue([
      {
        id: "wh-1",
        name: "Main Warehouse",
        createdAt: "2024-01-01",
        createdBy: "admin",
      },
    ]);
  });

  it("renders return form with order lines", async () => {
    render(
      <CreateSalesReturnDialog
        open={true}
        order={mockOrder}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByRole("heading", { name: /create return/i })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("prod-1")).toBeInTheDocument();
    });
  });

  it("shows validation error when warehouse is missing", async () => {
    render(
      <CreateSalesReturnDialog
        open={true}
        order={mockOrder}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /create return/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please fix the validation errors/i)
      ).toBeInTheDocument();
    });
    expect(salesOrdersService.createReturn).not.toHaveBeenCalled();
  });

  it("submits return when warehouse is selected", async () => {
    vi.mocked(salesOrdersService.createReturn).mockResolvedValue({} as never);

    render(
      <CreateSalesReturnDialog
        open={true}
        order={mockOrder}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(warehousesService.getWarehouses).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(await screen.findByRole("option", { name: /main warehouse/i }));
    fireEvent.click(screen.getByRole("button", { name: /create return/i }));

    await waitFor(() => {
      expect(salesOrdersService.createReturn).toHaveBeenCalledWith(
        "so-1",
        expect.objectContaining({
          warehouseId: "wh-1",
          lines: [{ productId: "prod-1", quantity: 2 }],
        })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
