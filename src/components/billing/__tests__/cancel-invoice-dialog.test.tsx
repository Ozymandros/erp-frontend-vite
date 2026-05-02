import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CancelInvoiceDialog } from "../cancel-invoice-dialog";
import { invoicesService } from "@/api/services/invoices.service";

vi.mock("@/api/services/invoices.service", () => ({
  invoicesService: {
    cancelInvoice: vi.fn(),
  },
}));

describe("CancelInvoiceDialog", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits cancellation payload", async () => {
    vi.mocked(invoicesService.cancelInvoice).mockResolvedValue({} as never);

    render(
      <CancelInvoiceDialog
        open={true}
        invoiceId="inv-1"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/reason/i), {
      target: { value: "Customer requested cancellation" },
    });
    fireEvent.click(screen.getByRole("button", { name: /cancel invoice/i }));

    await waitFor(() => {
      expect(invoicesService.cancelInvoice).toHaveBeenCalledWith("inv-1", {
        reason: "Customer requested cancellation",
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
