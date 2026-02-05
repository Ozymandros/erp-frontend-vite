import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditSupplierDialog } from '../edit-supplier-dialog';
import { suppliersService } from '@/api/services/suppliers.service';

vi.mock('@/api/services/suppliers.service', () => ({
  suppliersService: {
    updateSupplier: vi.fn(),
  },
}));

describe('EditSupplierDialog', () => {
  const mockSupplier = {
    id: '1',
    name: 'Test Supplier',
    email: 'supplier@example.com',
    phone: '1234567890',
    address: 'Test Address',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'test-user',
  };

  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open with supplier', () => {
    render(
      <EditSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText(/edit.*supplier/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <EditSupplierDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        supplier={mockSupplier}
      />
    );

    expect(screen.queryByText(/edit.*supplier/i)).not.toBeInTheDocument();
  });

  it('pre-fills form with supplier data', () => {
    render(
      <EditSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        supplier={mockSupplier}
      />
    );

    expect(screen.getByDisplayValue('Test Supplier')).toBeInTheDocument();
    expect(screen.getByDisplayValue('supplier@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
  });

  it('submits form with updated data', async () => {
    vi.mocked(suppliersService.updateSupplier).mockResolvedValue({ ...mockSupplier, name: 'Updated Supplier' });

    render(
      <EditSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        supplier={mockSupplier}
      />
    );

    const nameInput = screen.getByDisplayValue('Test Supplier');
    fireEvent.change(nameInput, { target: { value: 'Updated Supplier' } });

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(suppliersService.updateSupplier).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated Supplier',
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
