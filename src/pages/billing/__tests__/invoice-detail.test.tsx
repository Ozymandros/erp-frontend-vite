import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { InvoiceDetailPage } from "../invoice-detail";
import { invoicesService } from "@/api/services/invoices.service";

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  }),
}));

vi.mock("@/api/services/invoices.service", () => ({
  invoicesService: {
    getInvoiceById: vi.fn().mockResolvedValue({
      id: "inv-1",
      invoiceNumber: "INV-001",
      customerId: "c-1",
      orderId: "o-1",
      currency: "EUR",
      status: "Draft",
      issueDate: "2026-01-01T00:00:00.000Z",
      dueDate: "2026-01-31T00:00:00.000Z",
      totalNet: 100,
      totalTax: 21,
      totalGross: 121,
      outstandingAmount: 121,
      lines: [
        {
          id: "line-1",
          description: "Service",
          quantity: 1,
          unitPrice: 100,
          discount: 0,
          taxRate: 21,
          lineNet: 100,
          lineTax: 21,
          lineGross: 121,
        },
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    }),
    getPaymentsByInvoice: vi.fn().mockResolvedValue([]),
    getCreditNotesByInvoice: vi.fn().mockResolvedValue([]),
  },
}));

describe("InvoiceDetailPage", () => {
  it("renders invoice detail screen", async () => {
    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("INV-001")).toBeInTheDocument();
    });
    expect(screen.getByText(/invoice lines/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /issue/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /record payment/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create credit note/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel invoice/i })).toBeEnabled();
  });

  it("shows retry action when loading fails", async () => {
    vi.mocked(invoicesService.getInvoiceById).mockRejectedValueOnce(new Error("Boom"));

    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Boom")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });
  });
});
