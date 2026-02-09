import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CustomerDetailPage } from "../customer-detail";
import { customersService } from "@/api/services/customers.service";
import type { CustomerDto } from "@/types/api.types";

vi.mock("@/api/services/customers.service", () => ({
  customersService: {
    getCustomerById: vi.fn(),
  },
}));

const mockCustomer: CustomerDto = {
  id: "cust-1",
  name: "Test Customer",
  email: "customer@test.com",
  phoneNumber: "555-5678",
  address: "456 Customer Ave",
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2024-01-02T00:00:00Z",
  updatedBy: "admin",
};

function TestWrapper({ customerId = "cust-1" }: { customerId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/sales/customers/${customerId}`]}>
      <Routes>
        <Route path="/sales/customers/:id" element={<CustomerDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CustomerDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(customersService.getCustomerById).mockImplementation(() => new Promise(() => {}));

    render(<TestWrapper />);

    expect(screen.getByText(/Loading customer/i)).toBeInTheDocument();
  });

  it("should display customer details after loading", async () => {
    vi.mocked(customersService.getCustomerById).mockResolvedValue(mockCustomer);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Test Customer")).toBeInTheDocument();
    });

    expect(screen.getByText("customer@test.com")).toBeInTheDocument();
    expect(screen.getByText("555-5678")).toBeInTheDocument();
    expect(screen.getByText("456 Customer Ave")).toBeInTheDocument();
  });

  it("should display customer without optional fields", async () => {
    const minimalCustomer: CustomerDto = {
      id: "cust-2",
      name: "Minimal Customer",
      email: "minimal@test.com",
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "admin",
    };
    vi.mocked(customersService.getCustomerById).mockResolvedValue(minimalCustomer);

    render(<TestWrapper customerId="cust-2" />);

    await waitFor(() => {
      expect(screen.getByText("Minimal Customer")).toBeInTheDocument();
    });

    expect(screen.getByText("minimal@test.com")).toBeInTheDocument();
  });

  it("should handle error when customer not found", async () => {
    vi.mocked(customersService.getCustomerById).mockRejectedValue(new Error("Customer not found"));

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/customer not found/i)).toBeInTheDocument();
    });
  });

  it("should have back to customers link", async () => {
    vi.mocked(customersService.getCustomerById).mockResolvedValue(mockCustomer);

    render(<TestWrapper />);

    await waitFor(() => {
      const backLink = screen.getByRole("link", { name: /back to customers/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", "/sales/customers");
    });
  });

  it("should display updatedAt when present", async () => {
    vi.mocked(customersService.getCustomerById).mockResolvedValue(mockCustomer);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Test Customer")).toBeInTheDocument();
    });

    expect(screen.getByText(/Last Updated/i)).toBeInTheDocument();
  });
});
