import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteProductDialog } from '../delete-product-dialog';
import { productsService } from '@/api/services/products.service';

vi.mock('@/api/services/products.service', () => ({
  productsService: {
    deleteProduct: vi.fn(),
  },
}));

describe('DeleteProductDialog', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    sku: 'SKU001',
    price: 100,
    unitPrice: 100,
    stockQuantity: 10,
    quantityInStock: 10,
    reorderLevel: 5,
    categoryId: '1',
    categoryName: 'Category 1',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'test-user',
  };

  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <DeleteProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    expect(screen.getByRole('heading', { name: /delete product/i })).toBeInTheDocument();
  });

  it('displays product name in confirmation message', () => {
    render(
      <DeleteProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
  });

  it('handles delete confirmation', async () => {
    vi.mocked(productsService.deleteProduct).mockResolvedValue(undefined);

    render(
      <DeleteProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete product/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(productsService.deleteProduct).toHaveBeenCalledWith('1');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
