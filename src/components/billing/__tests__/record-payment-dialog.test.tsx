import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RecordPaymentDialog } from "../record-payment-dialog";
import { invoicesService } from "@/api/services/invoices.service";

vi.mock("@/api/services/invoices.service", () => ({
  invoicesService: {
    recordPayment: vi.fn(),
  },
}));

describe("RecordPaymentDialog", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits payment payload", async () => {
    vi.mocked(invoicesService.recordPayment).mockResolvedValue({} as never);

    render(
      <RecordPaymentDialog
        open={true}
        invoiceId="inv-1"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "120.5" },
    });
    fireEvent.change(screen.getByLabelText(/method/i), {
      target: { value: "BankTransfer" },
    });
    fireEvent.change(screen.getByLabelText(/paid at/i), {
      target: { value: "2026-01-20T00:00:00.000Z" },
    });
    const submitButton = screen.getByRole("button", { name: /record payment/i });
    const form = submitButton.closest("form");
    if (!form) {
      throw new Error("Expected submit button to be inside form");
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(invoicesService.recordPayment).toHaveBeenCalledWith("inv-1", {
        amount: 120.5,
        method: "BankTransfer",
        paidAt: "2026-01-20T00:00:00.000Z",
        externalPaymentId: undefined,
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
