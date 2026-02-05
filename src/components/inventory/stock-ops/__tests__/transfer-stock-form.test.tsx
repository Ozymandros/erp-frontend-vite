import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type React from 'react';
import { TransferStockForm } from '../transfer-stock-form';
import { stockOperationsService } from '@/api/services/stock-operations.service';

vi.mock('@/api/services/stock-operations.service', () => ({
  stockOperationsService: {
    transferStock: vi.fn(),
  },
}));
vi.mock('@/hooks/use-stock-operation-form', () => ({
  useStockOperationForm: (config: { onSubmit: (data: unknown) => void }, transformer: (formData: FormData) => unknown) => ({
    isLoading: false,
    error: null,
    success: false,
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = transformer(formData);
      config.onSubmit(data);
    },
  }),
}));

describe('TransferStockForm', () => {
  const mockProducts = [
    { id: '1', name: 'Product 1', sku: 'SKU001' },
    { id: '2', name: 'Product 2', sku: 'SKU002' },
  ];

  const mockWarehouses = [
    { id: '1', name: 'Warehouse 1' },
    { id: '2', name: 'Warehouse 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all fields', () => {
    render(<TransferStockForm products={mockProducts} warehouses={mockWarehouses} />);

    expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/from warehouse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to warehouse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
  });

  it('renders product and warehouse options', () => {
    render(<TransferStockForm products={mockProducts} warehouses={mockWarehouses} />);

    const productSelect = screen.getByLabelText(/product/i);
    expect(productSelect).toContainHTML('Product 1');
  });

  it('handles form submission', async () => {
    vi.mocked(stockOperationsService.transferStock).mockResolvedValue(undefined);

    render(<TransferStockForm products={mockProducts} warehouses={mockWarehouses} />);

    fireEvent.change(screen.getByLabelText(/product/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/from warehouse/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/to warehouse/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: 'Move stock' } });

    const form = screen.getByRole('button', { name: /transfer stock/i }).closest('form');
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(stockOperationsService.transferStock).toHaveBeenCalledWith({
        productId: '1',
        fromWarehouseId: '1',
        toWarehouseId: '2',
        quantity: 5,
        reason: 'Move stock',
      });
    });
  });
});
