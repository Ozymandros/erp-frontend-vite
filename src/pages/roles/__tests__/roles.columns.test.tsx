import { describe, it, expect, vi } from 'vitest';
import { getRoleColumns } from '../roles.columns';

describe('Roles Columns', () => {
  const mockProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canEdit: true,
    canDelete: true,
    canManagePermissions: true,
  };

  it('should define all required columns', () => {
    const columns = getRoleColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have name column', () => {
    const columns = getRoleColumns(mockProps);
    const column = columns.find(col => col.header === 'Name');
    expect(column).toBeDefined();
  });

  it('should have description column', () => {
    const columns = getRoleColumns(mockProps);
    const column = columns.find(col => col.header === 'Description');
    expect(column).toBeDefined();
  });

  it('should have permissions column', () => {
    const columns = getRoleColumns(mockProps);
    const column = columns.find(col => col.header === 'Permissions');
    expect(column).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getRoleColumns(mockProps);
    const column = columns.find(col => col.header === 'Actions');
    expect(column).toBeDefined();
  });
});
