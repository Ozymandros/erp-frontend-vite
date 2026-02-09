import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateWarehouseDialog } from '../create-warehouse-dialog';
import { warehousesService } from '@/api/services/warehouses.service';

vi.mock('@/api/services/warehouses.service', () => ({
  warehousesService: {
    createWarehouse: vi.fn(),
  },
}));

describe('CreateWarehouseDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <CreateWarehouseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByRole('heading', { name: /create new warehouse/i })).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(
      <CreateWarehouseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    vi.mocked(warehousesService.createWarehouse).mockResolvedValue({ id: '1', name: 'Test', location: 'Test Location', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' });

    render(
      <CreateWarehouseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Warehouse' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Test Location' } });

    const submitButton = screen.getByRole('button', { name: /create warehouse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(warehousesService.createWarehouse).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
