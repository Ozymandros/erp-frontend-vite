import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApprovePurchaseOrderDialog } from "../approve-purchase-order-dialog";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";

vi.mock("@/api/services/purchase-orders.service", () => ({
  purchaseOrdersService: {
    approvePurchaseOrder: vi.fn(),
  },
}));

describe("ApprovePurchaseOrderDialog", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    render(
      <ApprovePurchaseOrderDialog
        open={true}
        purchaseOrderId="po-1"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    expect(
      screen.getByRole("heading", { name: /approve purchase order/i })
    ).toBeInTheDocument();
  });

  it("submits approval with notes", async () => {
    vi.mocked(purchaseOrdersService.approvePurchaseOrder).mockResolvedValue(
      {} as never
    );

    render(
      <ApprovePurchaseOrderDialog
        open={true}
        purchaseOrderId="po-1"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "Looks good" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^approve$/i }));

    await waitFor(() => {
      expect(purchaseOrdersService.approvePurchaseOrder).toHaveBeenCalledWith(
        "po-1",
        { notes: "Looks good" }
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("shows error when approval fails", async () => {
    vi.mocked(purchaseOrdersService.approvePurchaseOrder).mockRejectedValue(
      new Error("Approval denied")
    );

    render(
      <ApprovePurchaseOrderDialog
        open={true}
        purchaseOrderId="po-1"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /^approve$/i }));

    await waitFor(() => {
      expect(screen.getByText("Approval denied")).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
