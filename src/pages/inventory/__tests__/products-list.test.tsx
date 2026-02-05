import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductsListPage } from '../products-list';

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
    searchProducts: vi.fn().mockResolvedValue({
      items: [
        { id: '1', name: 'Product 1', sku: 'SKU001', price: 100, stockQuantity: 10, categoryId: '1', categoryName: 'Category 1' },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    }),
    exportToXlsx: vi.fn().mockResolvedValue(new Blob()),
    exportToPdf: vi.fn().mockResolvedValue(new Blob()),
  },
}));

const MockedProductsListPage = () => (
  <BrowserRouter>
    <ProductsListPage />
  </BrowserRouter>
);

describe('ProductsListPage', () => {
  it('renders products list title', () => {
    render(<MockedProductsListPage />);
    expect(screen.getByRole('heading', { name: /products/i, level: 1 })).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<MockedProductsListPage />);
    expect(container).toBeInTheDocument();
  });
});
