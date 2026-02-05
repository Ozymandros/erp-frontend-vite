import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PermissionSelector } from '../permission-selector';
import { permissionsService } from '@/api/services/permissions.service';
import { rolesService } from '@/api/services/roles.service';

vi.mock('@/api/services/permissions.service', () => ({
  permissionsService: {
    getPermissions: vi.fn(),
  },
}));

vi.mock('@/api/services/roles.service', () => ({
  rolesService: {
    getRolePermissions: vi.fn(),
  },
}));

describe('PermissionSelector', () => {
  const mockPermissions = [
    { id: '1', name: 'permission1', module: 'Inventory', action: 'Read', description: 'Permission 1', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
    { id: '2', name: 'permission2', module: 'Sales', action: 'Create', description: 'Permission 2', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
    { id: '3', name: 'permission3', module: 'Sales', action: 'Delete', description: 'Permission 3', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(permissionsService.getPermissions).mockResolvedValue(mockPermissions);
    vi.mocked(rolesService.getRolePermissions).mockResolvedValue([mockPermissions[0], mockPermissions[1]]);
  });

  it('renders all permissions', async () => {
    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={[]}
        onPermissionsChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /inventory/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /sales/i })).toBeInTheDocument();
      expect(screen.getByText(/permission 1/i)).toBeInTheDocument();
      expect(screen.getByText(/permission 2/i)).toBeInTheDocument();
      expect(screen.getByText(/permission 3/i)).toBeInTheDocument();
      expect(screen.getByText('Read')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('shows selected permissions as checked', async () => {
    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={mockPermissions.slice(0, 2)}
        onPermissionsChange={mockOnChange}
      />
    );

    await waitFor(() => {
      const unassignButtons = screen.getAllByTitle(/unassign permission/i);
      expect(unassignButtons).toHaveLength(2);
    });
  });

  it('renders with empty permissions', async () => {
    vi.mocked(permissionsService.getPermissions).mockResolvedValue([]);
    vi.mocked(rolesService.getRolePermissions).mockResolvedValue([]);

    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={[]}
        onPermissionsChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/select all/i)).not.toBeInTheDocument();
    });
  });
});
