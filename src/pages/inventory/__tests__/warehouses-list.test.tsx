import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WarehousesListPage } from '../warehouses-list';

vi.mock('@/hooks/use-permissions', () => ({
  useModulePermissions: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  }),
}));

vi.mock('@/api/services/warehouses.service', () => ({
  warehousesService: {
    searchWarehouses: vi.fn().mockResolvedValue({
      items: [
        { id: '1', name: 'Warehouse 1', location: 'Location 1', capacity: 1000 },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

const MockedWarehousesListPage = () => (
  <BrowserRouter>
    <WarehousesListPage />
  </BrowserRouter>
);

describe('WarehousesListPage', () => {
  it('renders warehouses list', () => {
    render(<MockedWarehousesListPage />);
    expect(screen.getByRole('heading', { name: /warehouses/i, level: 1 })).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<MockedWarehousesListPage />);
    expect(container).toBeInTheDocument();
  });
});
