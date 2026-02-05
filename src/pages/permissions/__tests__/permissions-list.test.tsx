import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

const MockedPermissionsListPage = () => (
  <BrowserRouter>
    <PermissionsListPage />
  </BrowserRouter>
);

describe('PermissionsListPage', () => {
  it('renders permissions list', () => {
    render(<MockedPermissionsListPage />);
    expect(screen.getByRole('heading', { name: /permissions/i, level: 1 })).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<MockedPermissionsListPage />);
    expect(container).toBeInTheDocument();
  });
});
