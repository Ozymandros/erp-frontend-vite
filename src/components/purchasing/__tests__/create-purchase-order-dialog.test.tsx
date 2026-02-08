import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { CreatePurchaseOrderDialog } from '../create-purchase-order-dialog';
import { suppliersService } from '@/api/services/suppliers.service';
import { productsService } from '@/api/services/products.service';
import { purchaseOrdersService } from '@/api/services/purchase-orders.service';
import userEvent from '@testing-library/user-event';
import type { PurchaseOrderDto } from '@/types/api.types';

vi.mock('@/api/services/suppliers.service', () => ({
  suppliersService: {
    getSuppliers: vi.fn(),
  },
}));

vi.mock('@/api/services/products.service', () => ({
  productsService: {
    getProducts: vi.fn(),
  },
}));

vi.mock('@/api/services/purchase-orders.service', () => ({
  purchaseOrdersService: {
    createPurchaseOrder: vi.fn(),
  },
}));

describe('CreatePurchaseOrderDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockSuppliers = [
    { id: '1', name: 'Supplier 1', email: 'supplier1@example.com', phone: '123456', address: 'Address 1', isActive: true, createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
  ];

  const mockProducts = [
    { id: '1', name: 'Product 1', sku: 'SKU001', price: 100, unitPrice: 100, stockQuantity: 10, quantityInStock: 10, reorderLevel: 5, categoryId: '1', categoryName: 'Category 1', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(suppliersService.getSuppliers).mockResolvedValue(mockSuppliers);
    vi.mocked(productsService.getProducts).mockResolvedValue(mockProducts);
  });

  it('renders dialog when open', async () => {
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create purchase order/i })).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    render(
      <CreatePurchaseOrderDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText(/create.*purchase order/i)).not.toBeInTheDocument();
  });

  it('loads suppliers and products on open', async () => {
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(suppliersService.getSuppliers).toHaveBeenCalled();
      expect(productsService.getProducts).toHaveBeenCalled();
    });
  });

  it('renders supplier select field', async () => {
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/supplier/i)).toBeInTheDocument();
    });
  });

  it('handles add and remove line', async () => {
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    });

    // Add item
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    // Unit price is 0 by default in this component currently
    const costInput = screen.getByLabelText(/unit cost/i);
    await userEvent.clear(costInput);
    await userEvent.type(costInput, "50");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    const table = screen.getByRole('table');
    expect(within(table).getByText("Product 1")).toBeInTheDocument();
    expect(within(table).getAllByText("$50").length).toBeGreaterThanOrEqual(1);

    // Remove item
    const deleteBtn = screen.getByRole('table').querySelector('button .lucide-trash2')?.closest('button');
    if (deleteBtn) await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(within(table).queryByText("Product 1")).not.toBeInTheDocument();
    });
  });

  it('calculates total correctly', async () => {
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    });

    // Add item 1
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    const costInput = screen.getByLabelText(/unit cost/i);
    await userEvent.clear(costInput);
    await userEvent.type(costInput, "50");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    // Add item 2 (same product or different, doesn't matter for total calc)
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.clear(costInput);
    await userEvent.type(costInput, "150");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    expect(screen.getByText("$200")).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create purchase order/i })).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /create purchase order/i });
    expect(submitBtn).toBeDisabled(); // Disabled when empty lines
  });

  it('handles successful submission', async () => {
    vi.spyOn(purchaseOrdersService, 'createPurchaseOrder').mockResolvedValue({ id: 'po-1' } as PurchaseOrderDto);
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/supplier/i)).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText(/supplier/i), "1");
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    await userEvent.click(screen.getByRole('button', { name: /create purchase order/i }));

    await waitFor(() => {
      expect(purchaseOrdersService.createPurchaseOrder).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles submission error', async () => {
    vi.spyOn(purchaseOrdersService, 'createPurchaseOrder').mockRejectedValue(new Error('Po Error'));
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/supplier/i)).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText(/supplier/i), "1");
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    await userEvent.click(screen.getByRole('button', { name: /create purchase order/i }));

    await waitFor(() => {
      expect(screen.getByText('Po Error')).toBeInTheDocument();
    });
  });

  it('handles add line guards', async () => {
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    await waitFor(() => {
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    });
    
    // Should not add if no product
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));
    expect(within(screen.getByRole('table')).queryByText("Product 1")).toBeNull();

    // Should not add if quantity <= 0
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    const qtyInput = screen.getByLabelText(/qty/i);
    await userEvent.clear(qtyInput);
    await userEvent.type(qtyInput, "0");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));
    expect(within(screen.getByRole('table')).queryByText("Product 1")).toBeNull();
  });

  it('handles API error on load', async () => {
    vi.mocked(suppliersService.getSuppliers).mockRejectedValue(new Error('Load Error'));
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/failed to load suppliers or products/i)).toBeInTheDocument();
    });
  });

  it('handles optional expectedDeliveryDate', async () => {
    vi.spyOn(purchaseOrdersService, 'createPurchaseOrder').mockResolvedValue({ id: 'po-1' } as PurchaseOrderDto);
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    await waitFor(() => {
      expect(screen.getByLabelText(/supplier/i)).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText(/supplier/i), "1");
    const deliveryDate = screen.getByLabelText(/expected delivery/i);
    await userEvent.type(deliveryDate, "2024-12-31");
    
    await userEvent.selectOptions(screen.getByLabelText(/product/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));

    await userEvent.click(screen.getByRole('button', { name: /create purchase order/i }));

    await waitFor(() => {
      expect(purchaseOrdersService.createPurchaseOrder).toHaveBeenCalledWith(expect.objectContaining({
        expectedDeliveryDate: "2024-12-31"
      }));
    });
  });

  it('handles cancel button', async () => {
    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
