import { describe, it, expect, vi } from 'vitest';
import { getSalesOrderColumns, getSalesOrderStatusBadge } from '../sales-orders.columns';

describe('Sales Orders Columns', () => {
  const mockProps = {
    getCustomerName: vi.fn((id: string) => `Customer ${id}`),
  };

  it('should define all required columns', () => {
    const columns = getSalesOrderColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have customer column', () => {
    const columns = getSalesOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Customer');
    expect(column).toBeDefined();
  });

  it('should have status column', () => {
    const columns = getSalesOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Status');
    expect(column).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getSalesOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Actions');
    expect(column).toBeDefined();
  });

  it('should return correct status badge', () => {
    const badge = getSalesOrderStatusBadge('Draft');
    expect(badge).toBeDefined();
  });
});
