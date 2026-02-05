import { describe, it, expect, vi } from 'vitest';
import { getPermissionColumns } from '../permissions.columns';

describe('Permissions Columns', () => {
  const mockProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canEdit: true,
    canDelete: true,
  };

  it('should define all required columns', () => {
    const columns = getPermissionColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have module column', () => {
    const columns = getPermissionColumns(mockProps);
    const column = columns.find(col => col.header === 'Module');
    expect(column).toBeDefined();
  });

  it('should have action column', () => {
    const columns = getPermissionColumns(mockProps);
    const column = columns.find(col => col.header === 'Action');
    expect(column).toBeDefined();
  });

  it('should have description column', () => {
    const columns = getPermissionColumns(mockProps);
    const column = columns.find(col => col.header === 'Description');
    expect(column).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getPermissionColumns(mockProps);
    const column = columns.find(col => col.header === 'Actions');
    expect(column).toBeDefined();
  });
});
