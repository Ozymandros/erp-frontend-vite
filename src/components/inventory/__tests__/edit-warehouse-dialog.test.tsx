import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditWarehouseDialog } from '../edit-warehouse-dialog';
import { warehousesService } from '@/api/services/warehouses.service';

vi.mock('@/api/services/warehouses.service', () => ({
  warehousesService: {
    updateWarehouse: vi.fn(),
  },
}));

describe('EditWarehouseDialog', () => {
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
      <EditWarehouseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        warehouse={mockWarehouse}
      />
    );

    expect(screen.getByText(/edit.*warehouse/i)).toBeInTheDocument();
  });

  it('pre-fills form data', () => {
    render(
      <EditWarehouseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        warehouse={mockWarehouse}
      />
    );

    expect(screen.getByDisplayValue('Test Warehouse')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Location')).toBeInTheDocument();
  });

  it('submits updated data', async () => {
    vi.mocked(warehousesService.updateWarehouse).mockResolvedValue({ ...mockWarehouse, name: 'Updated Warehouse' });

    render(
      <EditWarehouseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        warehouse={mockWarehouse}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Warehouse');
    fireEvent.change(nameInput, { target: { value: 'Updated Warehouse' } });

    const submitButton = screen.getByRole('button', { name: /update warehouse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(warehousesService.updateWarehouse).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
