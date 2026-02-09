import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { getRoleColumns } from '../roles.columns';
import type { Role } from '@/types/api.types';

describe('Roles Columns', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockProps = {
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    canEdit: true,
    canDelete: true,
    canManagePermissions: true,
  };

  const mockRole: Role = {
    id: 'role1',
    name: 'Admin',
    description: 'Administrator role',
    permissions: [{ id: 'p1', module: 'users', action: 'read', createdAt: '2024-01-01', createdBy: 'admin' }],
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  };

  it('should define all required columns', () => {
    const columns = getRoleColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have name column with link', () => {
    const columns = getRoleColumns(mockProps);
    const nameCol = columns.find(col => col.header === 'Name');
    const accessor = nameCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockRole)}</MemoryRouter>);
      expect(container).toHaveTextContent('Admin');
      expect(container.querySelector('a')).toHaveAttribute('href', '/roles/role1');
    }
  });

  it('should have description column with dash fallback', () => {
    const columns = getRoleColumns(mockProps);
    const descCol = columns.find(col => col.header === 'Description');
    const accessor = descCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockRole)}</MemoryRouter>);
      expect(container).toHaveTextContent('Administrator role');
      const { container: c2 } = render(<MemoryRouter>{accessor({ ...mockRole, description: undefined })}</MemoryRouter>);
      expect(c2).toHaveTextContent('-');
    }
  });

  it('should have permissions column with badge count', () => {
    const columns = getRoleColumns(mockProps);
    const permCol = columns.find(col => col.header === 'Permissions');
    const accessor = permCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockRole)}</MemoryRouter>);
      expect(container).toHaveTextContent('1');
      expect(container).toHaveTextContent('permissions');
    }
  });

  it('should have actions column with Edit and Delete', async () => {
    const columns = getRoleColumns(mockProps);
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockRole)}</MemoryRouter>);
      await userEvent.click(screen.getByTitle('Edit Role'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockRole);
      await userEvent.click(screen.getByTitle('Delete Role'));
      expect(mockOnDelete).toHaveBeenCalledWith(mockRole);
    }
  });

  it('should show Manage Permissions when canManagePermissions is true', () => {
    const columns = getRoleColumns(mockProps);
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockRole)}</MemoryRouter>);
      expect(screen.getByTitle('Manage Permissions')).toBeInTheDocument();
    }
  });

  it('should hide Edit when canEdit is false', () => {
    const columns = getRoleColumns({ ...mockProps, canEdit: false });
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockRole)}</MemoryRouter>);
      expect(screen.queryByTitle('Edit Role')).not.toBeInTheDocument();
    }
  });

  it('should hide Delete when canDelete is false', () => {
    const columns = getRoleColumns({ ...mockProps, canDelete: false });
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockRole)}</MemoryRouter>);
      expect(screen.queryByTitle('Delete Role')).not.toBeInTheDocument();
    }
  });
});
