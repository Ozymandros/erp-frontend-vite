import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SupplierDetailPage } from "../supplier-detail";
import { suppliersService } from "@/api/services/suppliers.service";
import type { SupplierDto } from "@/types/api.types";

vi.mock("@/api/services/suppliers.service", () => ({
  suppliersService: {
    getSupplierById: vi.fn(),
  },
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(() => ({ canUpdate: true, canDelete: true })),
}));

const mockSupplier: SupplierDto = {
  id: "sup-1",
  name: "Test Supplier",
  email: "supplier@test.com",
  phone: "555-1234",
  address: "123 Supplier St",
  city: "New York",
  country: "USA",
  postalCode: "10001",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2024-01-02T00:00:00Z",
  updatedBy: "admin",
};

function TestWrapper({ supplierId = "sup-1" }: { supplierId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/purchasing/suppliers/${supplierId}`]}>
      <Routes>
        <Route path="/purchasing/suppliers/:id" element={<SupplierDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SupplierDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(suppliersService.getSupplierById).mockImplementation(() => new Promise(() => {}));

    render(<TestWrapper />);

    expect(screen.getByText(/Loading supplier/i)).toBeInTheDocument();
  });

  it("should display supplier details after loading", async () => {
    vi.mocked(suppliersService.getSupplierById).mockResolvedValue(mockSupplier);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Test Supplier")).toBeInTheDocument();
    });

    expect(screen.getByText("supplier@test.com")).toBeInTheDocument();
    expect(screen.getByText("555-1234")).toBeInTheDocument();
    expect(screen.getByText("123 Supplier St")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("USA")).toBeInTheDocument();
    expect(screen.getByText("10001")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should display inactive badge when supplier is inactive", async () => {
    const inactiveSupplier = { ...mockSupplier, isActive: false };
    vi.mocked(suppliersService.getSupplierById).mockResolvedValue(inactiveSupplier);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });
  });

  it("should show no address on file when address fields are empty", async () => {
    const supplierNoAddress = {
      ...mockSupplier,
      address: undefined,
      city: undefined,
      country: undefined,
      postalCode: undefined,
    };
    vi.mocked(suppliersService.getSupplierById).mockResolvedValue(supplierNoAddress);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("No address on file")).toBeInTheDocument();
    });
  });

  it("should have Edit and Delete buttons when permitted", async () => {
    vi.mocked(suppliersService.getSupplierById).mockResolvedValue(mockSupplier);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Test Supplier")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("should handle error when supplier not found", async () => {
    vi.mocked(suppliersService.getSupplierById).mockRejectedValue(new Error("Supplier not found"));

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/supplier not found/i)).toBeInTheDocument();
    });
  });

  it("should have back to suppliers link", async () => {
    vi.mocked(suppliersService.getSupplierById).mockResolvedValue(mockSupplier);

    render(<TestWrapper />);

    await waitFor(() => {
      const backLink = screen.getByRole("link", { name: /back to suppliers/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", "/purchasing/suppliers");
    });
  });

  it("should open edit dialog when Edit clicked", async () => {
    vi.mocked(suppliersService.getSupplierById).mockResolvedValue(mockSupplier);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Test Supplier")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
