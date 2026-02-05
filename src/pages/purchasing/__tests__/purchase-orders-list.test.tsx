import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PurchaseOrdersListPage } from '../purchase-orders-list';

vi.mock('@/hooks/use-permissions', () => ({
  useModulePermissions: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  }),
}));

vi.mock('@/api/services/purchase-orders.service', () => ({
  purchaseOrdersService: {
    searchPurchaseOrders: vi.fn().mockResolvedValue({
      items: [
        { id: '1', supplierId: '1', orderDate: '2024-01-01', totalAmount: 1000, status: 'PENDING' },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

const MockedPurchaseOrdersListPage = () => (
  <BrowserRouter>
    <PurchaseOrdersListPage />
  </BrowserRouter>
);

describe('PurchaseOrdersListPage', () => {
  it('renders purchase orders list', () => {
    render(<MockedPurchaseOrdersListPage />);
    expect(screen.getByRole('heading', { name: /purchase orders/i, level: 1 })).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<MockedPurchaseOrdersListPage />);
    expect(container).toBeInTheDocument();
  });
});
