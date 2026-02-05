import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type React from 'react';
import { AdjustStockForm } from '../adjust-stock-form';
import { stockOperationsService } from '@/api/services/stock-operations.service';

vi.mock('@/api/services/stock-operations.service', () => ({
  stockOperationsService: {
    adjustStock: vi.fn(),
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

describe('AdjustStockForm', () => {
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
    render(<AdjustStockForm products={mockProducts} warehouses={mockWarehouses} />);

    expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/warehouse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adjustment type/i)).toBeInTheDocument();
  });

  it('renders product options', () => {
    render(<AdjustStockForm products={mockProducts} warehouses={mockWarehouses} />);

    const productSelect = screen.getByLabelText(/product/i);
    expect(productSelect).toContainHTML('Product 1 (SKU001)');
    expect(productSelect).toContainHTML('Product 2 (SKU002)');
  });

  it('renders warehouse options', () => {
    render(<AdjustStockForm products={mockProducts} warehouses={mockWarehouses} />);

    const warehouseSelect = screen.getByLabelText(/warehouse/i);
    expect(warehouseSelect).toContainHTML('Warehouse 1');
    expect(warehouseSelect).toContainHTML('Warehouse 2');
  });

  it('handles form submission', async () => {
    vi.mocked(stockOperationsService.adjustStock).mockResolvedValue(undefined);

    render(<AdjustStockForm products={mockProducts} warehouses={mockWarehouses} />);

    fireEvent.change(screen.getByLabelText(/product/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/warehouse/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: 'Test reason' } });
    fireEvent.change(screen.getByLabelText(/adjustment type/i), { target: { value: 'Increase' } });

    const submitButton = screen.getByRole('button', { name: /adjust stock/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(stockOperationsService.adjustStock).toHaveBeenCalledWith({
        productId: '1',
        warehouseId: '1',
        quantity: 10,
        reason: 'Test reason',
        adjustmentType: 'Increase',
      });
    });
  });

  it('renders with empty arrays', () => {
    render(<AdjustStockForm products={[]} warehouses={[]} />);

    expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/warehouse/i)).toBeInTheDocument();
  });
});
