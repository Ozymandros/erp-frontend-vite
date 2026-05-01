import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IssueInvoiceDialog } from "../issue-invoice-dialog";
import { invoicesService } from "@/api/services/invoices.service";

vi.mock("@/api/services/invoices.service", () => ({
  invoicesService: {
    issueInvoice: vi.fn(),
  },
}));

describe("IssueInvoiceDialog", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits issue payload", async () => {
    vi.mocked(invoicesService.issueInvoice).mockResolvedValue({} as never);

    render(
      <IssueInvoiceDialog
        open={true}
        invoiceId="inv-1"
        currentInvoiceNumber="INV-2026-001"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/invoice number/i), {
      target: { value: "INV-2026-002" },
    });
    fireEvent.change(screen.getByLabelText(/issue date/i), {
      target: { value: "2026-01-10T00:00:00.000Z" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^issue$/i }));

    await waitFor(() => {
      expect(invoicesService.issueInvoice).toHaveBeenCalledWith("inv-1", {
        invoiceNumber: "INV-2026-002",
        issueDate: "2026-01-10T00:00:00.000Z",
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows validation errors", async () => {
    render(
      <IssueInvoiceDialog
        open={true}
        invoiceId="inv-1"
        currentInvoiceNumber="INV-2026-001"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/invoice number/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/issue date/i), {
      target: { value: "not-a-date" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^issue$/i }));

    await waitFor(() => {
      expect(screen.getByText(/invoice number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/issue date must be a valid date-time/i)).toBeInTheDocument();
      expect(invoicesService.issueInvoice).not.toHaveBeenCalled();
    });
  });
});
