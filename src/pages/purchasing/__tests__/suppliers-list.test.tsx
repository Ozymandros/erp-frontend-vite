import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SuppliersListPage } from '../suppliers-list';

vi.mock('@/hooks/use-permissions', () => ({
  useModulePermissions: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  }),
}));

vi.mock('@/api/services/suppliers.service', () => ({
  suppliersService: {
    advancedSearchSuppliers: vi.fn().mockResolvedValue({
      items: [
        { id: '1', name: 'Supplier 1', email: 'supplier1@example.com', phone: '123456', address: 'Address 1' },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

const MockedSuppliersListPage = () => (
  <BrowserRouter>
    <SuppliersListPage />
  </BrowserRouter>
);

describe('SuppliersListPage', () => {
  it('renders suppliers list', async () => {
    render(<MockedSuppliersListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /suppliers/i, level: 1 })).toBeInTheDocument();
    });
  });

  it('renders without crashing', async () => {
    const { container } = render(<MockedSuppliersListPage />);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });
});
