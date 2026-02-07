import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { getSupplierColumns } from '../suppliers.columns';
import type { SupplierDto } from '@/types/api.types';

describe('Suppliers Columns', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockProps = {
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    canEdit: true,
    canDelete: true,
  };

  const mockSupplier: SupplierDto = {
    id: 'sup1',
    name: 'Test Supplier',
    email: 'sup@test.com',
    phone: '555-1234',
    address: '123 St',
    city: 'NYC',
    country: 'USA',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  };

  it('should define all required columns', () => {
    const columns = getSupplierColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have name column with link', () => {
    const columns = getSupplierColumns(mockProps);
    const nameCol = columns.find(col => col.header === 'Name');
    const accessor = nameCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockSupplier)}</MemoryRouter>);
      expect(container).toHaveTextContent('Test Supplier');
      expect(container.querySelector('a')).toHaveAttribute('href', '/purchasing/suppliers/sup1');
    }
  });

  it('should have email column showing email or dash', () => {
    const columns = getSupplierColumns(mockProps);
    const emailCol = columns.find(col => col.header === 'Email');
    const accessor = emailCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockSupplier)}</MemoryRouter>);
      expect(container).toHaveTextContent('sup@test.com');
    }
  });

  it('should show Active/Inactive badge', () => {
    const columns = getSupplierColumns(mockProps);
    const statusCol = columns.find(col => col.header === 'Status');
    const accessor = statusCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockSupplier)}</MemoryRouter>);
      expect(container).toHaveTextContent('Active');
      const { container: c2 } = render(
        <MemoryRouter>{accessor({ ...mockSupplier, isActive: false })}</MemoryRouter>
      );
      expect(c2).toHaveTextContent('Inactive');
    }
  });

  it('should have actions column', async () => {
    const columns = getSupplierColumns(mockProps);
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockSupplier)}</MemoryRouter>);
      await userEvent.click(screen.getByTitle('Edit Supplier'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockSupplier);
    }
  });
});
