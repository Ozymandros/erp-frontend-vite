/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

vi.mock("@/api/services/customers.service", () => ({
  customersService: {
    createCustomer: vi.fn(),
  },
}));

import { CreateCustomerDialog } from "../create-customer-dialog";
import { customersService } from "@/api/services/customers.service";

describe("CreateCustomerDialog", () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create customer form when open", () => {
    render(
      <CreateCustomerDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Create New Customer")).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <CreateCustomerDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText("Create New Customer")).not.toBeInTheDocument();
  });

  it("should handle successful customer creation", async () => {
    vi.mocked(customersService.createCustomer).mockResolvedValue({
      id: "cust-1",
      name: "Acme Corp",
      email: "contact@acme.com",
      phoneNumber: "",
      address: "",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any);

    render(
      <CreateCustomerDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Acme Corp" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "contact@acme.com" } });

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);
    else fireEvent.click(screen.getByRole("button", { name: /create customer/i }));

    await waitFor(() => {
      expect(customersService.createCustomer).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should display error on creation failure", async () => {
    vi.mocked(customersService.createCustomer).mockRejectedValue(new Error("Email already in use"));

    render(
      <CreateCustomerDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Acme Corp" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "existing@acme.com" } });

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);
    else fireEvent.click(screen.getByRole("button", { name: /create customer/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });

  it("should call onOpenChange when Cancel is clicked", async () => {
    render(
      <CreateCustomerDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
