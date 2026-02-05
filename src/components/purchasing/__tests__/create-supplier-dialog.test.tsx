import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateSupplierDialog } from '../create-supplier-dialog';
import { suppliersService } from '@/api/services/suppliers.service';

vi.mock('@/api/services/suppliers.service', () => ({
  suppliersService: {
    createSupplier: vi.fn(),
  },
}));

describe('CreateSupplierDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <CreateSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByRole('heading', { name: /create new supplier/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CreateSupplierDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText(/create.*supplier/i)).not.toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(
      <CreateSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    vi.mocked(suppliersService.createSupplier).mockResolvedValue({ id: '1', name: 'Test', email: 'test@example.com', isActive: true, createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' });

    render(
      <CreateSupplierDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Supplier' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'supplier@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: 'Test Address' } });

    const submitButton = screen.getByRole('button', { name: /create supplier/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(suppliersService.createSupplier).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Supplier',
          email: 'supplier@example.com',
          phone: '1234567890',
          address: 'Test Address',
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
