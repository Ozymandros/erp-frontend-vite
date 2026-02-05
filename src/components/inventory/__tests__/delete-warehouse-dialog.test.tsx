import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteWarehouseDialog } from '../delete-warehouse-dialog';
import { warehousesService } from '@/api/services/warehouses.service';

vi.mock('@/api/services/warehouses.service', () => ({
  warehousesService: {
    deleteWarehouse: vi.fn(),
  },
}));

describe('DeleteWarehouseDialog', () => {
  const mockWarehouse = {
    id: '1',
    name: 'Test Warehouse',
    location: 'Test Location',
    capacity: 1000,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'test-user',
  };

  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  it('renders dialog when open', () => {
    render(
      <DeleteWarehouseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        warehouse={mockWarehouse}
      />
    );

    expect(screen.getByRole('heading', { name: /delete warehouse/i })).toBeInTheDocument();
  });

  it('displays warehouse name', () => {
    render(
      <DeleteWarehouseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        warehouse={mockWarehouse}
      />
    );

    expect(screen.getByText(/Test Warehouse/i)).toBeInTheDocument();
  });

  it('handles delete', async () => {
    vi.mocked(warehousesService.deleteWarehouse).mockResolvedValue(undefined);

    render(
      <DeleteWarehouseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        warehouse={mockWarehouse}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete warehouse/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(warehousesService.deleteWarehouse).toHaveBeenCalledWith('1');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
