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
        { id: '1', supplierId: '1', orderDate: '2024-01-01', totalAmount: 1000, status: 'PENDING', orderNumber: 'PO-001' },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

vi.mock('@/api/services/suppliers.service', () => ({
  suppliersService: {
    getSuppliers: vi.fn().mockResolvedValue([
      { id: '1', name: 'Supplier 1' },
    ]),
  },
}));

const MockedPurchaseOrdersListPage = () => (
  <BrowserRouter>
    <PurchaseOrdersListPage />
  </BrowserRouter>
);

describe('PurchaseOrdersListPage', () => {
  it('renders purchase orders list', async () => {
    render(<MockedPurchaseOrdersListPage />);
    expect(
      await screen.findByRole('heading', { name: /purchase orders/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MockedPurchaseOrdersListPage />);
    await screen.findByRole('heading', { name: /purchase orders/i, level: 1 });
    expect(container).toBeInTheDocument();
  });
});
