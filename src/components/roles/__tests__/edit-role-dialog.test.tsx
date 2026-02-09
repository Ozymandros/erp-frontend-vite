import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { EditRoleDialog } from '../edit-role-dialog';
import { rolesService } from '@/api/services/roles.service';
import type { Role } from '@/types/api.types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/api/services/roles.service', () => ({
  rolesService: {
    updateRole: vi.fn(),
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
      <EditRoleDialog
        open={open}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
        role={mockRole as Role}
      />
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

  it('handles successful update', async () => {
    vi.mocked(rolesService.updateRole).mockResolvedValue(undefined);
    renderDialog(true);

    fireEvent.change(screen.getByLabelText(/role name/i), { target: { value: 'Updated Name' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(rolesService.updateRole).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated Name',
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles update failure', async () => {
    vi.mocked(rolesService.updateRole).mockRejectedValue(new Error('Update failed'));
    renderDialog(true);

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('navigates to manage permissions', () => {
    renderDialog(true);

    fireEvent.click(screen.getByRole('button', { name: /manage permissions/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/roles/1');
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
