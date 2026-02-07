import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { getProductColumns } from '../products.columns';
import type { ProductDto } from '@/types/api.types';

describe('Products Columns', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockProps = {
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    canEdit: true,
    canDelete: true,
  };

  const mockProduct: ProductDto = {
    id: 'p1',
    name: 'Test Product',
    sku: 'SKU001',
    unitPrice: 99.99,
    quantityInStock: 50,
    reorderLevel: 10,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  };

  it('should define all required columns', () => {
    const columns = getProductColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have SKU column', () => {
    const columns = getProductColumns(mockProps);
    const column = columns.find(col => col.accessor === 'sku');
    expect(column).toBeDefined();
    expect(column?.header).toBe('SKU');
  });

  it('should have name column', () => {
    const columns = getProductColumns(mockProps);
    const column = columns.find(col => col.accessor === 'name');
    expect(column).toBeDefined();
    expect(column?.header).toBe('Name');
  });

  it('should have price column that formats currency', () => {
    const columns = getProductColumns(mockProps);
    const priceCol = columns.find(col => col.header === 'Price');
    expect(priceCol).toBeDefined();
    const accessor = priceCol?.accessor;
    if (typeof accessor === 'function') {
      const result = accessor(mockProduct);
      expect(result).toBe('$99.99');
    }
  });

  it('should have stock column showing quantity and alert when low', () => {
    const columns = getProductColumns(mockProps);
    const stockCol = columns.find(col => col.header === 'Stock');
    expect(stockCol).toBeDefined();
    const accessor = stockCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockProduct)}</MemoryRouter>);
      expect(container).toHaveTextContent('50');
    }
  });

  it('should show alert icon in stock column when below reorder level', () => {
    const columns = getProductColumns(mockProps);
    const stockCol = columns.find(col => col.header === 'Stock');
    const lowStockProduct = { ...mockProduct, quantityInStock: 5, reorderLevel: 10 };
    const accessor = stockCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(lowStockProduct)}</MemoryRouter>);
      expect(container).toHaveTextContent('5');
      expect(container.querySelector('svg')).toBeInTheDocument();
    }
  });

  it('should have actions column with Edit and Delete buttons', async () => {
    const columns = getProductColumns(mockProps);
    const actionsCol = columns.find(col => col.header === 'Actions');
    expect(actionsCol).toBeDefined();
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockProduct)}</MemoryRouter>);
      expect(screen.getByTitle('View Details')).toBeInTheDocument();
      expect(screen.getByTitle('Edit Product')).toBeInTheDocument();
      expect(screen.getByTitle('Delete Product')).toBeInTheDocument();

      await userEvent.click(screen.getByTitle('Edit Product'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);

      await userEvent.click(screen.getByTitle('Delete Product'));
      expect(mockOnDelete).toHaveBeenCalledWith(mockProduct);
    }
  });

  it('should hide Edit when canEdit is false', () => {
    const columns = getProductColumns({ ...mockProps, canEdit: false });
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockProduct)}</MemoryRouter>);
      expect(screen.queryByTitle('Edit Product')).not.toBeInTheDocument();
    }
  });

  it('should hide Delete when canDelete is false', () => {
    const columns = getProductColumns({ ...mockProps, canDelete: false });
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockProduct)}</MemoryRouter>);
      expect(screen.queryByTitle('Delete Product')).not.toBeInTheDocument();
    }
  });
});
