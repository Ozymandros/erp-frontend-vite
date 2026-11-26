import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReceivePurchaseOrderDialog } from "../receive-purchase-order-dialog";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";
import { warehousesService } from "@/api/services/warehouses.service";
import type { PurchaseOrderDto } from "@/types/api.types";
import { PurchaseOrderStatus } from "@/types/api.types";

vi.mock("@/api/services/purchase-orders.service", () => ({
  purchaseOrdersService: {
    receivePurchaseOrder: vi.fn(),
  },
}));

vi.mock("@/api/services/warehouses.service", () => ({
  warehousesService: {
    getWarehouses: vi.fn(),
  },
}));

const mockOrder: PurchaseOrderDto = {
  id: "po-1",
  orderNumber: "PO-001",
  supplierId: "supplier-1",
  status: PurchaseOrderStatus.Approved,
  orderDate: "2024-01-01",
  totalAmount: 200,
  lines: [
    {
      id: "line-1",
      purchaseOrderId: "po-1",
      productId: "prod-1",
      quantity: 4,
      unitPrice: 50,
      lineTotal: 200,
      createdAt: "2024-01-01",
      createdBy: "admin",
    },
  ],
  createdAt: "2024-01-01",
  createdBy: "admin",
  updatedAt: "2024-01-01",
};

describe("ReceivePurchaseOrderDialog", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(warehousesService.getWarehouses).mockResolvedValue([
      {
        id: "wh-1",
        name: "Main Warehouse",
        location: "Building A",
        createdAt: "2024-01-01",
        createdBy: "admin",
      },
    ]);
  });

  it("renders receive form", async () => {
    render(
      <ReceivePurchaseOrderDialog
        open={true}
        order={mockOrder}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByRole("heading", { name: /receive purchase order/i })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("prod-1")).toBeInTheDocument();
    });
  });

  it("submits receive payload after selecting warehouse", async () => {
    vi.mocked(purchaseOrdersService.receivePurchaseOrder).mockResolvedValue(
      {} as never
    );

    render(
      <ReceivePurchaseOrderDialog
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
    fireEvent.click(screen.getByRole("button", { name: /^receive$/i }));

    await waitFor(() => {
      expect(purchaseOrdersService.receivePurchaseOrder).toHaveBeenCalledWith(
        "po-1",
        expect.objectContaining({
          warehouseId: "wh-1",
          lines: [
            expect.objectContaining({
              purchaseOrderLineId: "line-1",
              receivedQuantity: 4,
            }),
          ],
        })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows error when receive fails", async () => {
    vi.mocked(purchaseOrdersService.receivePurchaseOrder).mockRejectedValue(
      new Error("Receive failed")
    );

    render(
      <ReceivePurchaseOrderDialog
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
    fireEvent.click(screen.getByRole("button", { name: /^receive$/i }));

    await waitFor(() => {
      expect(screen.getByText("Receive failed")).toBeInTheDocument();
    });
  });
});
