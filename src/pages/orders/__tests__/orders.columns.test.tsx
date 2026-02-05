import { describe, it, expect, vi } from 'vitest';
import { getOrderColumns, getStatusBadge } from '../orders.columns';

describe('Orders Columns', () => {
  const mockProps = {
    getCustomerName: vi.fn((id: string) => `Customer ${id}`),
  };

  it('should define all required columns', () => {
    const columns = getOrderColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have order number column', () => {
    const columns = getOrderColumns(mockProps);
    const column = columns.find(col => col.accessor === 'orderNumber');
    expect(column).toBeDefined();
    expect(column?.header).toBe('Order Number');
  });

  it('should have customer column', () => {
    const columns = getOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Customer');
    expect(column).toBeDefined();
  });

  it('should have status column', () => {
    const columns = getOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Status');
    expect(column).toBeDefined();
  });

  it('should have total column', () => {
    const columns = getOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Total Amount');
    expect(column).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getOrderColumns(mockProps);
    const column = columns.find(col => col.header === 'Actions');
    expect(column).toBeDefined();
  });

  it('should return correct status badge', () => {
    const badge = getStatusBadge('Draft');
    expect(badge).toBeDefined();
  });
});
