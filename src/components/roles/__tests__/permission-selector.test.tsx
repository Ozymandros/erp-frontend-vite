import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PermissionSelector } from '../permission-selector';
import { permissionsService } from '@/api/services/permissions.service';
import { rolesService } from '@/api/services/roles.service';

import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/api/services/permissions.service', () => ({
  permissionsService: {
    getPermissions: vi.fn(),
  },
}));

vi.mock('@/api/services/roles.service', () => ({
  rolesService: {
    getRolePermissions: vi.fn(),
    addPermissionToRole: vi.fn(),
    removePermissionFromRole: vi.fn(),
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

describe('PermissionSelector interactions', () => {
  const mockPermissions = [
    { id: '1', name: 'permission1', module: 'Inventory', action: 'Read', description: 'Permission 1', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
    { id: '2', name: 'permission2', module: 'Sales', action: 'Create', description: 'Permission 2', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
    { id: '3', name: 'permission3', module: 'Sales', action: 'Delete', description: 'Permission 3', createdAt: '2024-01-01T00:00:00Z', createdBy: 'test-user' },
  ];
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(permissionsService.getPermissions).mockResolvedValue(mockPermissions);
    vi.mocked(rolesService.getRolePermissions).mockResolvedValue([mockPermissions[0]]);
  });

  it('assigns a permission when clicking assign', async () => {
    vi.mocked(rolesService.addPermissionToRole).mockResolvedValue(undefined);
    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={[mockPermissions[0]]}
        onPermissionsChange={mockOnChange}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/permission 2/i)).toBeInTheDocument();
    });
    // Find all permission labels
    const permissionLabels = screen.getAllByText(/permission \d/i);
    let found = false;
    for (const label of permissionLabels) {
      if (label.textContent?.toLowerCase().includes('permission 2')) {
        // Traverse up to the permission card/container
        let container = label.parentElement;
        let tries = 0;
        while (container && tries < 5) {
          // Look for the assign button in this container
          const btn = container.querySelector('button[title*="assign permission" i]');
          if (btn) {
            fireEvent.click(btn);
            found = true;
            break;
          }
          container = container.parentElement;
          tries++;
        }
        if (found) break;
      }
    }
    expect(found).toBe(true);
    await waitFor(() => expect(rolesService.addPermissionToRole).toHaveBeenCalledWith('role-1', '2'));
  });

  it('deselects all permissions in a module', async () => {
    vi.mocked(rolesService.removePermissionFromRole).mockResolvedValue(undefined);
    // All Inventory permissions are assigned, so Select All should remove them
    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={mockPermissions.filter(p => p.module === 'Inventory')}
        onPermissionsChange={mockOnChange}
      />
    );
    // Use getAllByText to avoid ambiguity between dropdown and heading
    await waitFor(() => {
      const headings = screen.getAllByText(/inventory/i);
      const heading = headings.find(el => el.tagName === 'H3');
      expect(heading).toBeDefined();
    });
    // Find all select/deselect all buttons
    const selectAllButtons = screen.getAllByRole('button', { name: /select all/i });
    // Find the button that is in the same module section as the Inventory heading
    const headings = screen.getAllByText(/inventory/i);
    const heading = headings.find(el => el.tagName === 'H3');
    expect(heading).toBeDefined();
    // Find the select all button that is a sibling or descendant of the Inventory heading's parent
    const selectAllBtn = selectAllButtons.find(btn => {
      let el = btn.parentElement;
      while (el) {
        if (heading && el.contains(heading)) return true;
        el = el.parentElement;
      }
      return false;
    });
    expect(selectAllBtn).toBeDefined();
    if (selectAllBtn) {
      await userEvent.click(selectAllBtn);
    }
    await waitFor(() => expect(rolesService.removePermissionFromRole).toHaveBeenCalled());
  });

  it('unassigns a permission when clicking unassign', async () => {
    vi.mocked(rolesService.removePermissionFromRole).mockResolvedValue(undefined);
    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={[mockPermissions[0]]}
        onPermissionsChange={mockOnChange}
      />
    );
    await waitFor(() => expect(screen.getByText(/permission 1/i)).toBeInTheDocument());
    const unassignBtn = screen.getAllByTitle(/unassign permission/i)[0];
    await userEvent.click(unassignBtn);
    await waitFor(() => expect(rolesService.removePermissionFromRole).toHaveBeenCalledWith('role-1', '1'));
  });

  it('selects all permissions in a module', async () => {
    vi.mocked(rolesService.addPermissionToRole).mockResolvedValue(undefined);
    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={[]}
        onPermissionsChange={mockOnChange}
      />
    );
    // Use heading role for specificity
    await waitFor(() => expect(screen.getByRole('heading', { name: /inventory/i })).toBeInTheDocument());
    const inventoryHeading = screen.getByRole('heading', { name: /inventory/i });
    const selectAllBtns = screen.getAllByRole('button', { name: /select all/i });
    // Find the select all button closest to the Inventory heading
    let selectAllBtn;
    for (const btn of selectAllBtns) {
      if (inventoryHeading && inventoryHeading.parentElement && inventoryHeading.parentElement.contains(btn)) {
        selectAllBtn = btn;
        break;
      }
    }
    // Fallback: use the first if not found
    if (!selectAllBtn) selectAllBtn = selectAllBtns[0];
    await userEvent.click(selectAllBtn);
    await waitFor(() => expect(rolesService.addPermissionToRole).toHaveBeenCalled());
  });

  it('shows error message on API error', async () => {
    vi.mocked(rolesService.addPermissionToRole).mockRejectedValue({ message: 'API error' });
    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={[]}
        onPermissionsChange={mockOnChange}
      />
    );
    await waitFor(() => expect(screen.getByText(/permission 1/i)).toBeInTheDocument());
    const assignBtn = screen.getAllByTitle(/assign permission/i)[0];
    await userEvent.click(assignBtn);
    await waitFor(() => expect(screen.getByText(/failed to assign permission/i)).toBeInTheDocument());
  });

  it('renders in readonly mode (no assign/unassign buttons)', async () => {
    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={mockPermissions}
        onPermissionsChange={mockOnChange}
        readonly
      />
    );
    await waitFor(() => expect(screen.getByText(/permission 1/i)).toBeInTheDocument());
    expect(screen.queryByTitle(/assign permission/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/unassign permission/i)).not.toBeInTheDocument();
  });

  it('filters permissions by search', async () => {
    render(
      <PermissionSelector
        roleId="role-1"
        initialPermissions={[]}
        onPermissionsChange={mockOnChange}
      />
    );
    await waitFor(() => expect(screen.getByText(/permission 1/i)).toBeInTheDocument());
    const searchInput = screen.getByPlaceholderText(/search permissions/i);
    await userEvent.type(searchInput, 'Delete');
    await waitFor(() => expect(screen.getByText(/permission 3/i)).toBeInTheDocument());
    expect(screen.queryByText(/permission 1/i)).not.toBeInTheDocument();
  });
});
