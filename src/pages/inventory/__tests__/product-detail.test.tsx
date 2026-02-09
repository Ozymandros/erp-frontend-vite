import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProductDetailPage } from "../product-detail";
import { productsService } from "@/api/services/products.service";
import type { ProductDto } from "@/types/api.types";

vi.mock("@/api/services/products.service", () => ({
  productsService: {
    getProductById: vi.fn(),
  },
}));

const mockProduct: ProductDto = {
  id: "prod-1",
  name: "Test Product",
  sku: "SKU001",
  description: "A test product",
  unitPrice: 99.99,
  quantityInStock: 50,
  reorderLevel: 10,
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
  updatedAt: "2024-01-02T00:00:00Z",
  updatedBy: "admin",
};

function TestWrapper({ productId = "prod-1" }: { productId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/inventory/products/${productId}`]}>
      <Routes>
        <Route path="/inventory/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProductDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(productsService.getProductById).mockImplementation(() => new Promise(() => {}));

    render(<TestWrapper />);

    expect(screen.getByText(/Loading product/i)).toBeInTheDocument();
  });

  it("should display product details after loading", async () => {
    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    expect(screen.getByText("SKU001")).toBeInTheDocument();
    expect(screen.getByText("A test product")).toBeInTheDocument();
    expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();
    expect(screen.getByText(/50 units/)).toBeInTheDocument();
    expect(screen.getByText(/10 units/)).toBeInTheDocument();
  });

  it("should show below reorder level warning when stock is low", async () => {
    const lowStockProduct = { ...mockProduct, quantityInStock: 5, reorderLevel: 10 };
    vi.mocked(productsService.getProductById).mockResolvedValue(lowStockProduct);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/5 units/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Below reorder level/i)).toBeInTheDocument();
  });

  it("should have Edit and Delete buttons", async () => {
    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("should handle error when product not found", async () => {
    vi.mocked(productsService.getProductById).mockRejectedValue(new Error("Product not found"));

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/product not found/i)).toBeInTheDocument();
    });
  });

  it("should have back to products link", async () => {
    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);

    render(<TestWrapper />);

    await waitFor(() => {
      const backLink = screen.getByRole("link", { name: /back to products/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", "/inventory/products");
    });
  });

  it("should open edit dialog when Edit clicked", async () => {
    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);

    render(<TestWrapper />);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
