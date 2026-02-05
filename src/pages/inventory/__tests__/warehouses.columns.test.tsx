import { describe, it, expect, vi } from 'vitest';
import { getWarehouseColumns } from '../warehouses.columns';

describe('Warehouses Columns', () => {
  const mockProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canEdit: true,
    canDelete: true,
  };

  it('should define all required columns', () => {
    const columns = getWarehouseColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have name column', () => {
    const columns = getWarehouseColumns(mockProps);
    const column = columns.find(col => col.accessor === 'name');
    expect(column).toBeDefined();
    expect(column?.header).toBe('Name');
  });

  it('should have location column', () => {
    const columns = getWarehouseColumns(mockProps);
    const column = columns.find(col => col.header === 'Location');
    expect(column).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getWarehouseColumns(mockProps);
    const column = columns.find(col => col.header === 'Actions');
    expect(column).toBeDefined();
  });
});
