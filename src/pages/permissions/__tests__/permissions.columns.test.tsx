import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { getPermissionColumns } from '../permissions.columns';
import type { Permission } from '@/types/api.types';

describe('Permissions Columns', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockProps = {
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    canEdit: true,
    canDelete: true,
  };

  const mockPermission: Permission = {
    id: 'perm1',
    module: 'inventory',
    action: 'read',
    description: 'View inventory',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  };

  it('should define all required columns', () => {
    const columns = getPermissionColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have module column', () => {
    const columns = getPermissionColumns(mockProps);
    const column = columns.find(col => col.header === 'Module');
    expect(column).toBeDefined();
  });

  it('should have action column', () => {
    const columns = getPermissionColumns(mockProps);
    const column = columns.find(col => col.header === 'Action');
    expect(column).toBeDefined();
  });

  it('should have description column showing description or dash', () => {
    const columns = getPermissionColumns(mockProps);
    const descCol = columns.find(col => col.header === 'Description');
    const accessor = descCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockPermission)}</MemoryRouter>);
      expect(container).toHaveTextContent('View inventory');
    }
  });

  it('should have actions column with Edit and Delete', async () => {
    const columns = getPermissionColumns(mockProps);
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockPermission)}</MemoryRouter>);
      await userEvent.click(screen.getByTitle('Edit Permission'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockPermission);
      await userEvent.click(screen.getByTitle('Delete Permission'));
      expect(mockOnDelete).toHaveBeenCalledWith(mockPermission);
    }
  });
});
