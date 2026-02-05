import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EditRoleDialog } from '../edit-role-dialog';

vi.mock('@/api/services/permissions.service', () => ({
  permissionsService: {
    getAllPermissions: vi.fn().mockResolvedValue([
      { id: '1', name: 'permission1', description: 'Permission 1' },
      { id: '2', name: 'permission2', description: 'Permission 2' },
    ]),
  },
}));

describe('EditRoleDialog', () => {
  const mockRole = {
    id: '1',
    name: 'Test Role',
    description: 'Test Description',
    permissionIds: ['1'],
    permissions: [],
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'test-user',
  };

  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  const renderDialog = (open: boolean) =>
    render(
      <BrowserRouter>
        <EditRoleDialog
          open={open}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
          role={mockRole}
        />
      </BrowserRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    renderDialog(true);

    expect(screen.getByText(/edit.*role/i)).toBeInTheDocument();
  });

  it('pre-fills form with role data', () => {
    renderDialog(true);

    expect(screen.getByDisplayValue('Test Role')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderDialog(false);

    expect(screen.queryByText(/edit.*role/i)).not.toBeInTheDocument();
  });
});
