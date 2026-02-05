import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditProductDialog } from '../edit-product-dialog';

vi.mock('@/api/services/products.service', () => ({
  productsService: {
    updateProduct: vi.fn(),
  },
}));

describe('EditProductDialog', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    sku: 'SKU001',
    unitPrice: 100,
    reorderLevel: 10,
    description: 'Test description',
    categoryId: '1',
    categoryName: 'Category 1',
    quantityInStock: 100,
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
      <EditProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    expect(screen.getByText(/edit.*product/i)).toBeInTheDocument();
  });

  it('pre-fills form with product data', () => {
    render(
      <EditProductDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SKU001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });
});
