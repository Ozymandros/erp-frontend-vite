import { describe, it, expect, vi } from 'vitest';
import { getSupplierColumns } from '../suppliers.columns';

describe('Suppliers Columns', () => {
  const mockProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canEdit: true,
    canDelete: true,
  };

  it('should define all required columns', () => {
    const columns = getSupplierColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have name column', () => {
    const columns = getSupplierColumns(mockProps);
    const column = columns.find(col => col.header === 'Name');
    expect(column).toBeDefined();
  });

  it('should have email column', () => {
    const columns = getSupplierColumns(mockProps);
    const column = columns.find(col => col.header === 'Email');
    expect(column).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getSupplierColumns(mockProps);
    const column = columns.find(col => col.header === 'Actions');
    expect(column).toBeDefined();
  });
});
