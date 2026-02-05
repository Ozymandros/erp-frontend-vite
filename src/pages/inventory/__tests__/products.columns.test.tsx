import { describe, it, expect, vi } from 'vitest';
import { getProductColumns } from '../products.columns';

describe('Products Columns', () => {
  const mockProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canEdit: true,
    canDelete: true,
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

  it('should have price column', () => {
    const columns = getProductColumns(mockProps);
    const column = columns.find(col => col.header === 'Price');
    expect(column).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getProductColumns(mockProps);
    const column = columns.find(col => col.header === 'Actions');
    expect(column).toBeDefined();
  });
});
