import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReserveStockForm } from '../reserve-stock-form';
import type { OrderDto } from '@/types/api.types';

vi.mock('@/api/services/stock-operations.service');
vi.mock('@/hooks/use-stock-operation-form', () => ({
  useStockOperationForm: () => ({
    isLoading: false,
    error: null,
    success: false,
    handleSubmit: vi.fn((e) => e.preventDefault()),
  }),
}));

describe('ReserveStockForm', () => {
  const mockProducts = [{ id: '1', name: 'Product 1', sku: 'SKU001' }];
  const mockWarehouses = [{ id: '1', name: 'Warehouse 1' }];
  const mockOrders: OrderDto[] = [{ 
    id: '1', 
    orderNumber: 'SO-001', 
    status: 'Pending' as OrderDto['status'],
    orderDate: '2024-01-01T00:00:00Z', 
    customerId: 'cust-1', 
    orderLines: [], 
    totalAmount: 0, 
    createdAt: '2024-01-01T00:00:00Z', 
    createdBy: 'test-user' 
  }];

  it('renders form with all fields', () => {
    render(
      <ReserveStockForm
        products={mockProducts}
        warehouses={mockWarehouses}
        orders={mockOrders}
      />
    );

    expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/warehouse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/order/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expires at/i)).toBeInTheDocument();
  });
});
