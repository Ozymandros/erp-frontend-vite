import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CustomersListPage } from '../customers-list';

vi.mock('@/hooks/use-permissions', () => ({
  useModulePermissions: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  }),
}));

vi.mock('@/api/services/customers.service', () => ({
  customersService: {
    searchCustomers: vi.fn().mockResolvedValue({
      items: [
        { id: '1', name: 'Customer 1', email: 'customer1@example.com', phone: '123456', address: 'Address 1' },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

const MockedCustomersListPage = () => (
  <BrowserRouter>
    <CustomersListPage />
  </BrowserRouter>
);

describe('CustomersListPage', () => {
  it('renders customers list', () => {
    render(<MockedCustomersListPage />);
    expect(screen.getByRole('heading', { name: /customers/i, level: 1 })).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<MockedCustomersListPage />);
    expect(container).toBeInTheDocument();
  });
});
