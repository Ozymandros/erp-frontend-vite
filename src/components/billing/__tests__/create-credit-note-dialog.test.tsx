import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreateCreditNoteDialog } from "../create-credit-note-dialog";
import { invoicesService } from "@/api/services/invoices.service";

vi.mock("@/api/services/invoices.service", () => ({
  invoicesService: {
    createCreditNote: vi.fn(),
  },
}));

describe("CreateCreditNoteDialog", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits credit note payload", async () => {
    vi.mocked(invoicesService.createCreditNote).mockResolvedValue({} as never);

    render(
      <CreateCreditNoteDialog
        open={true}
        invoiceId="inv-1"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/reason/i), {
      target: { value: "Price correction" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Correction line" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add credit line/i }));
    fireEvent.click(screen.getByRole("button", { name: /create credit note/i }));

    await waitFor(() => {
      expect(invoicesService.createCreditNote).toHaveBeenCalledWith(
        "inv-1",
        expect.objectContaining({
          reason: "Price correction",
          lines: expect.arrayContaining([
            expect.objectContaining({
              description: "Correction line",
            }),
          ]),
        })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
