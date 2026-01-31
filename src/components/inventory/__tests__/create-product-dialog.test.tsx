/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

vi.mock("@/api/services/products.service", () => ({
  productsService: {
    createProduct: vi.fn(),
  },
}));

import { CreateProductDialog } from "../create-product-dialog";
import { productsService } from "@/api/services/products.service";

describe("CreateProductDialog", () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create product form when open", () => {
    render(
      <CreateProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Create New Product")).toBeInTheDocument();
    expect(screen.getByLabelText(/^sku/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <CreateProductDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText("Create New Product")).not.toBeInTheDocument();
  });

  it("should handle successful product creation", async () => {
    vi.mocked(productsService.createProduct).mockResolvedValue({
      id: "prod-1",
      sku: "SKU001",
      name: "Test Product",
      description: "",
      unitPrice: 10,
      reorderLevel: 5,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any);

    render(
      <CreateProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/^sku/i), { target: { value: "SKU001" } });
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Test Product" } });
    fireEvent.change(screen.getByLabelText(/unit price/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/reorder level/i), { target: { value: "5" } });

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);
    else fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(productsService.createProduct).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should display error on creation failure", async () => {
    vi.mocked(productsService.createProduct).mockRejectedValue(new Error("SKU already exists"));

    render(
      <CreateProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/^sku/i), { target: { value: "SKU001" } });
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Test Product" } });
    fireEvent.change(screen.getByLabelText(/unit price/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/reorder level/i), { target: { value: "5" } });

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);
    else fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(screen.getByText(/sku already exists/i)).toBeInTheDocument();
    });
  });

  it("should show validation errors for empty required fields", async () => {
    render(
      <CreateProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/please fix the validation errors/i)).toBeInTheDocument();
    });
  });

  it("should call onOpenChange when Cancel is clicked", async () => {
    render(
      <CreateProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
