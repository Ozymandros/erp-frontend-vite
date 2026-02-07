import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ProductsListPage } from '../products-list';
import { productsService } from '@/api/services/products.service';

vi.mock('@/hooks/use-permissions', () => ({
  useModulePermissions: () => ({
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canExport: true,
  }),
}));

vi.mock('@/api/services/products.service', () => ({
  productsService: {
    searchProducts: vi.fn(),
    getLowStockProducts: vi.fn(),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

const mockSearchResponse = {
  items: [
    { id: '1', name: 'Product 1', sku: 'SKU001', unitPrice: 100, quantityInStock: 10, reorderLevel: 5, createdAt: '2024-01-01', createdBy: 'admin' },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const MockedProductsListPage = () => (
  <BrowserRouter>
    <ProductsListPage />
  </BrowserRouter>
);

describe('ProductsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsService.searchProducts).mockResolvedValue(mockSearchResponse);
    vi.mocked(productsService.getLowStockProducts).mockResolvedValue([]);
  });

  it('renders products list title', async () => {
    render(<MockedProductsListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /products/i, level: 1 })).toBeInTheDocument();
    });
  });

  it('renders without crashing', async () => {
    const { container } = render(<MockedProductsListPage />);
    await waitFor(() => {
      expect(productsService.searchProducts).toHaveBeenCalled();
    });
    expect(container).toBeInTheDocument();
  });

  it('toggles Low Stock filter when button clicked', async () => {
    vi.mocked(productsService.getLowStockProducts).mockResolvedValue([
      { id: '2', name: 'Low Stock Product', sku: 'SKU002', unitPrice: 50, quantityInStock: 2, reorderLevel: 10, createdAt: '2024-01-01', createdBy: 'admin' },
    ]);
    render(<MockedProductsListPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /low stock/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /low stock/i }));

    await waitFor(() => {
      expect(productsService.getLowStockProducts).toHaveBeenCalled();
    });

    await userEvent.click(screen.getByRole('button', { name: /show all/i }));

    await waitFor(() => {
      expect(productsService.searchProducts).toHaveBeenCalled();
    });
  });

  it('opens create dialog when Add Product clicked', async () => {
    render(<MockedProductsListPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /add product/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
