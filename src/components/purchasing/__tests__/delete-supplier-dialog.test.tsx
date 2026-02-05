import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteSupplierDialog } from '../delete-supplier-dialog';
import { suppliersService } from '@/api/services/suppliers.service';

vi.mock('@/api/services/suppliers.service', () => ({
  suppliersService: {
    deleteSupplier: vi.fn(),
  },
}));

describe('DeleteSupplierDialog', () => {
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
      <DeleteSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        supplier={mockSupplier}
      />
    );

    expect(screen.getByRole('heading', { name: /delete supplier/i })).toBeInTheDocument();
  });

  it('displays supplier name in confirmation message', () => {
    render(
      <DeleteSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        supplier={mockSupplier}
      />
    );

    expect(screen.getByText(/Test Supplier/i)).toBeInTheDocument();
  });

  it('handles delete confirmation', async () => {
    vi.mocked(suppliersService.deleteSupplier).mockResolvedValue(undefined);

    render(
      <DeleteSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        supplier={mockSupplier}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(suppliersService.deleteSupplier).toHaveBeenCalledWith('1');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles cancel action', () => {
    render(
      <DeleteSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        supplier={mockSupplier}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
