import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreateInvoiceDialog } from "../create-invoice-dialog";
import { invoicesService } from "@/api/services/invoices.service";

vi.mock("@/api/services/invoices.service", () => ({
  invoicesService: {
    createInvoice: vi.fn(),
  },
}));

vi.mock("@/api/services/customers.service", () => ({
  customersService: {
    getCustomers: vi.fn().mockResolvedValue([
      {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Customer One",
        email: "c1@example.com",
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
      },
    ]),
  },
}));

vi.mock("@/api/services/orders.service", () => ({
  ordersService: {
    getOrders: vi.fn().mockResolvedValue([
      {
        id: "22222222-2222-4222-8222-222222222222",
        orderNumber: "ORD-001",
        customerId: "11111111-1111-4111-8111-111111111111",
        status: "Pending",
        orderDate: "2026-01-01",
        totalAmount: 100,
        orderLines: [],
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
      },
    ]),
  },
}));

describe("CreateInvoiceDialog", () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog content when open", async () => {
    render(
      <CreateInvoiceDialog
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByRole("heading", { name: /create invoice/i })).toBeInTheDocument();
    expect(await screen.findByLabelText(/customer/i)).toBeInTheDocument();
  });

  it("submits valid invoice payload", async () => {
    vi.mocked(invoicesService.createInvoice).mockResolvedValue({
      id: "inv-1",
      invoiceNumber: "INV-001",
        customerId: "11111111-1111-4111-8111-111111111111",
        orderId: "22222222-2222-4222-8222-222222222222",
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
    });

    render(
      <CreateInvoiceDialog
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(await screen.findByLabelText(/customer/i), {
      target: { value: "11111111-1111-4111-8111-111111111111" },
    });
    fireEvent.change(screen.getByLabelText(/invoice number/i), {
      target: { value: "INV-2026-100" },
    });
    fireEvent.change(screen.getByLabelText(/^currency$/i), {
      target: { value: "EUR" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Invoice line" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add line/i }));
    fireEvent.click(screen.getByRole("button", { name: /create invoice/i }));

    await waitFor(() => {
      expect(invoicesService.createInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceNumber: "INV-2026-100",
          customerId: "11111111-1111-4111-8111-111111111111",
          currency: "EUR",
        })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows validation error when invoice number is missing", async () => {
    render(
      <CreateInvoiceDialog
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(await screen.findByLabelText(/customer/i), {
      target: { value: "11111111-1111-4111-8111-111111111111" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Invoice line" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add line/i }));
    fireEvent.click(screen.getByRole("button", { name: /create invoice/i }));

    await waitFor(() => {
      expect(screen.getByText(/invoice number is required/i)).toBeInTheDocument();
      expect(invoicesService.createInvoice).not.toHaveBeenCalled();
    });
  });
});
