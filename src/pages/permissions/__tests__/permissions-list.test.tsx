import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PermissionsListPage } from '../permissions-list';

vi.mock('@/hooks/use-permissions', () => ({
  useModulePermissions: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  }),
}));

vi.mock('@/api/services/permissions.service', () => ({
  permissionsService: {
    searchPermissions: vi.fn().mockResolvedValue({
      items: [
        { id: '1', name: 'permission1', description: 'Permission 1' },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

vi.mock('@/api/services/roles.service', () => ({
  rolesService: {
    getRoles: vi.fn().mockResolvedValue([
      { id: '1', name: 'Admin', description: 'Admin role' },
    ]),
  },
}));

const MockedPermissionsListPage = () => (
  <BrowserRouter>
    <PermissionsListPage />
  </BrowserRouter>
);

describe('PermissionsListPage', () => {
  it('renders permissions list', async () => {
    render(<MockedPermissionsListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /permissions/i, level: 1 })).toBeInTheDocument();
    });
  });

  it('renders without crashing', async () => {
    const { container } = render(<MockedPermissionsListPage />);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });
});
