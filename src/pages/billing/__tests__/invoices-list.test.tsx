import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { InvoicesListPage } from "../invoices-list";
import { invoicesService } from "@/api/services/invoices.service";

const modulePermissions = {
  canCreate: true,
  canRead: true,
  canUpdate: true,
  canDelete: true,
  canExport: true,
};

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: () => modulePermissions,
}));

vi.mock("@/api/services/invoices.service", () => ({
  invoicesService: {
    searchInvoices: vi.fn().mockResolvedValue({
      items: [
        {
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
          lines: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

vi.mock("@/api/services/customers.service", () => ({
  customersService: { getCustomers: vi.fn().mockResolvedValue([]) },
}));

vi.mock("@/api/services/orders.service", () => ({
  ordersService: { getOrders: vi.fn().mockResolvedValue([]) },
}));

describe("InvoicesListPage", () => {
  it("renders invoices list page", async () => {
    render(
      <BrowserRouter>
        <InvoicesListPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /invoices/i, level: 1 })
      ).toBeInTheDocument();
    });
  });

  it("loads invoices from service", async () => {
    render(
      <BrowserRouter>
        <InvoicesListPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(invoicesService.searchInvoices).toHaveBeenCalled();
      expect(screen.getByText("INV-001")).toBeInTheDocument();
    });
  });
});
