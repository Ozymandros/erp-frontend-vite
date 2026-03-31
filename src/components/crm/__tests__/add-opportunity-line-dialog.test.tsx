import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

const mockOnOpenChange = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock("@/api/services/products.service", () => ({
  productsService: {
    getProducts: vi.fn(),
  },
}));

vi.mock("@/api/services/crm-opportunities.service", () => ({
  crmOpportunitiesService: {
    addOpportunityLine: vi.fn(),
  },
}));

import { AddOpportunityLineDialog } from "../add-opportunity-line-dialog";
import { productsService } from "@/api/services/products.service";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";
import type { ProductDto } from "@/types/api.types";

describe("AddOpportunityLineDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads products and renders form", async () => {
    const products: ProductDto[] = [
      {
        id: "p1",
        name: "Product A",
        sku: "SKU1",
        unitPrice: 10,
        createdAt: "",
        createdBy: "",
      } as ProductDto,
    ];
    vi.mocked(productsService.getProducts).mockResolvedValue(products);

    render(
      <AddOpportunityLineDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        opportunityId="opp-1"
      />,
    );

    expect(
      screen.getByRole("heading", { name: /add opportunity line/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Product A/i)).toBeInTheDocument();
    });
  });

  it("submits a new line and calls onSuccess", async () => {
    const products: ProductDto[] = [
      {
        id: "p1",
        name: "Product A",
        sku: "SKU1",
        unitPrice: 10,
        createdAt: "",
        createdBy: "",
      } as ProductDto,
    ];
    vi.mocked(productsService.getProducts).mockResolvedValue(products);
    vi.mocked(crmOpportunitiesService.addOpportunityLine).mockResolvedValue({
      id: "line-1",
      opportunityId: "opp-1",
      productId: "p1",
      sku: "SKU1",
      description: "Product A",
      quantity: 1,
      unitPrice: 10,
      discountPercent: 0,
      lineTotal: 10,
      createdAt: "",
      createdBy: "",
    });

    render(
      <AddOpportunityLineDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        opportunityId="opp-1"
      />,
    );

    await waitFor(() =>
      expect(screen.getByText(/Product A/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Line item" },
    });
    fireEvent.change(screen.getByLabelText(/Product/i), {
      target: { value: "p1" },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/Unit Price/i), {
      target: { value: "10" },
    });

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(crmOpportunitiesService.addOpportunityLine).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
