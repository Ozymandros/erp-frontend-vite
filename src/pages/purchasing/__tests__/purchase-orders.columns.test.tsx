import { describe, it, expect, vi } from 'vitest';
import { getPurchaseOrderColumns, getPurchaseOrderStatusBadge } from '../purchase-orders.columns';

describe('Purchase Orders Columns', () => {
  const mockProps = {
    getSupplierName: vi.fn((id: string) => `Supplier ${id}`),
  };

  it('should define all required columns', () => {
    const columns = getPurchaseOrderColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have supplier column', () => {
    const columns = getPurchaseOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Supplier');
    expect(column).toBeDefined();
  });

  it('should have status column', () => {
    const columns = getPurchaseOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Status');
    expect(column).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getPurchaseOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Actions');
    expect(column).toBeDefined();
  });

  it('should return correct status badge', () => {
    const badge = getPurchaseOrderStatusBadge('Draft');
    expect(badge).toBeDefined();
  });
});
