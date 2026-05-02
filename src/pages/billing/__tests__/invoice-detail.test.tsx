import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { InvoiceDetailPage } from "../invoice-detail";
import { invoicesService } from "@/api/services/invoices.service";
import type { InvoiceDto, PaymentDto, CreditNoteDto } from "@/types/api.types";

const baseInvoice: InvoiceDto = {
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
};

const mockPayments: PaymentDto[] = [
  {
    id: "pay-1",
    invoiceId: "inv-1",
    amount: 50,
    currency: "EUR",
    method: "BankTransfer",
    status: "Completed",
    paidAt: "2026-01-15T00:00:00.000Z",
  },
];

const mockCreditNotes: CreditNoteDto[] = [
  {
    id: "cn-1",
    originalInvoiceId: "inv-1",
    reason: "Return",
    status: "Issued",
    totalNet: 20,
    totalTax: 4.2,
    totalGross: 24.2,
    createdAt: "2026-01-20T00:00:00.000Z",
  },
];

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
    getInvoiceById: vi.fn(),
    getPaymentsByInvoice: vi.fn(),
    getCreditNotesByInvoice: vi.fn(),
  },
}));

describe("InvoiceDetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(invoicesService.getInvoiceById).mockResolvedValue(baseInvoice);
    vi.mocked(invoicesService.getPaymentsByInvoice).mockResolvedValue([]);
    vi.mocked(invoicesService.getCreditNotesByInvoice).mockResolvedValue([]);
  });

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

  it("enables record payment button when invoice is issued", async () => {
    vi.mocked(invoicesService.getInvoiceById).mockResolvedValue({
      ...baseInvoice,
      status: "Issued",
      outstandingAmount: 121,
    });

    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /record payment/i })).toBeEnabled();
    });
  });

  it("enables create credit note button when invoice is paid", async () => {
    vi.mocked(invoicesService.getInvoiceById).mockResolvedValue({
      ...baseInvoice,
      status: "Paid",
      outstandingAmount: 0,
    });

    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create credit note/i })).toBeEnabled();
    });
  });

  it("displays payments when invoice has payments", async () => {
    vi.mocked(invoicesService.getPaymentsByInvoice).mockResolvedValue(mockPayments);

    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("1 payments")).toBeInTheDocument();
    });
  });

  it("displays credit notes when invoice has credit notes", async () => {
    vi.mocked(invoicesService.getCreditNotesByInvoice).mockResolvedValue(mockCreditNotes);

    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("1 credit notes")).toBeInTheDocument();
    });
  });

  it("shows invoice summary with customer and order info", async () => {
    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/invoice summary/i)).toBeInTheDocument();
      expect(screen.getByText(/customer id/i)).toBeInTheDocument();
      expect(screen.getByText("c-1")).toBeInTheDocument();
    });
  });

  it("shows totals in summary card", async () => {
    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Totals")).toBeInTheDocument();
    });
  });

  it("shows empty state for no payments", async () => {
    vi.mocked(invoicesService.getPaymentsByInvoice).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no payments recorded/i)).toBeInTheDocument();
    });
  });

  it("shows empty state for no credit notes", async () => {
    vi.mocked(invoicesService.getCreditNotesByInvoice).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/billing/invoices/inv-1"]}>
        <Routes>
          <Route path="/billing/invoices/:id" element={<InvoiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no credit notes created/i)).toBeInTheDocument();
    });
  });
});
