import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RolesListPage } from '../roles-list';

vi.mock('@/hooks/use-permissions', () => ({
  useModulePermissions: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  }),
}));

vi.mock('@/api/services/roles.service', () => ({
  rolesService: {
    searchRoles: vi.fn().mockResolvedValue({
      items: [
        { id: '1', name: 'Role 1', description: 'Description 1', permissionIds: [] },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

const MockedRolesListPage = () => (
  <BrowserRouter>
    <RolesListPage />
  </BrowserRouter>
);

describe('RolesListPage', () => {
  it('renders roles list', () => {
    render(<MockedRolesListPage />);
    expect(screen.getByRole('heading', { name: /roles/i, level: 1 })).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<MockedRolesListPage />);
    expect(container).toBeInTheDocument();
  });
});
