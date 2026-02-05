import { describe, it, expect } from 'vitest';
import { getCustomerColumns } from '../customers.columns';

describe('Customers Columns', () => {
  it('should define all required columns', () => {
    const columns = getCustomerColumns();
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have name column', () => {
    const columns = getCustomerColumns();
    const column = columns.find(col => col.accessor === 'name');
    expect(column).toBeDefined();
    expect(column?.header).toBe('Name');
  });

  it('should have email column', () => {
    const columns = getCustomerColumns();
    const column = columns.find(col => col.header === 'Email');
    expect(column).toBeDefined();
  });

  it('should have phone column', () => {
    const columns = getCustomerColumns();
    const column = columns.find(col => col.header === 'Phone');
    expect(column).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getCustomerColumns();
    const column = columns.find(col => col.header === 'Actions');
    expect(column).toBeDefined();
  });
});
