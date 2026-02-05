import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CreatePurchaseOrderDialog } from '../create-purchase-order-dialog';
import { suppliersService } from '@/api/services/suppliers.service';
import { productsService } from '@/api/services/products.service';

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

  it('handles API error', async () => {
    vi.mocked(suppliersService.getSuppliers).mockRejectedValue(new Error('API Error'));

    render(
      <CreatePurchaseOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
