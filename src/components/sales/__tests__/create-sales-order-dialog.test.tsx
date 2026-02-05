import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CreateSalesOrderDialog } from '../create-sales-order-dialog';
import { customersService } from '@/api/services/customers.service';
import { productsService } from '@/api/services/products.service';

vi.mock('@/api/services/customers.service', () => ({
  customersService: {
    getCustomers: vi.fn(),
  },
}));

vi.mock('@/api/services/products.service', () => ({
  productsService: {
    getProducts: vi.fn(),
  },
}));

describe('CreateSalesOrderDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  const mockCustomers = [
    { id: '1', name: 'Customer 1', email: 'customer1@example.com', phone: '123456', address: 'Address 1', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
  ];

  const mockProducts = [
    { id: '1', name: 'Product 1', sku: 'SKU001', price: 100, unitPrice: 100, stockQuantity: 10, quantityInStock: 10, reorderLevel: 5, categoryId: '1', categoryName: 'Category 1', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customersService.getCustomers).mockResolvedValue(mockCustomers);
    vi.mocked(productsService.getProducts).mockResolvedValue(mockProducts);
  });

  it('renders dialog when open', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create sales order/i })).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    render(
      <CreateSalesOrderDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByRole('heading', { name: /create sales order/i })).not.toBeInTheDocument();
  });

  it('loads customers and products on open', async () => {
    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(customersService.getCustomers).toHaveBeenCalled();
      expect(productsService.getProducts).toHaveBeenCalled();
    });
  });

  it('handles API error', async () => {
    vi.mocked(customersService.getCustomers).mockRejectedValue(new Error('API Error'));

    render(
      <CreateSalesOrderDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load customers or products/i)).toBeInTheDocument();
    });
  });
});
