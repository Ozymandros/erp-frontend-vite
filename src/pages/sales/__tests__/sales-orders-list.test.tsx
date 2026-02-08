import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SalesOrdersListPage } from '../sales-orders-list';

vi.mock('@/hooks/use-permissions', () => ({
  useModulePermissions: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  }),
}));

vi.mock('@/api/services/sales-orders.service', () => ({
  salesOrdersService: {
    searchSalesOrders: vi.fn().mockResolvedValue({
      items: [
        { id: '1', customerId: '1', orderDate: '2024-01-01', totalAmount: 1000, status: 'PENDING' },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

vi.mock('@/api/services/customers.service', () => ({
  customersService: {
    getCustomers: vi.fn().mockResolvedValue([
      { id: '1', name: 'Customer 1', email: 'customer1@example.com', phone: '123456', address: 'Address 1' },
    ]),
  },
}));

const MockedSalesOrdersListPage = () => (
  <BrowserRouter>
    <SalesOrdersListPage />
  </BrowserRouter>
);

describe('SalesOrdersListPage', () => {
  it('renders sales orders list', async () => {
    render(<MockedSalesOrdersListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sales orders/i, level: 1 })).toBeInTheDocument();
    });
  });

  it('renders without crashing', async () => {
    const { container } = render(<MockedSalesOrdersListPage />);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });
});
