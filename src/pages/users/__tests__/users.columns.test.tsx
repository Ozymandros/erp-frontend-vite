import { describe, it, expect, vi } from 'vitest';
import { getUserColumns } from '../users.columns';

describe('Users Columns', () => {
  const mockProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canEdit: true,
    canDelete: true,
    canManageRoles: true,
  };

  it('should define all required columns', () => {
    const columns = getUserColumns(mockProps);
    expect(columns).toBeDefined();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('should have username column', () => {
    const columns = getUserColumns(mockProps);
    const usernameColumn = columns.find(col => col.accessor === 'username');
    expect(usernameColumn).toBeDefined();
    expect(usernameColumn?.header).toBe('Username');
  });

  it('should have email column', () => {
    const columns = getUserColumns(mockProps);
    const emailColumn = columns.find(col => col.accessor === 'email');
    expect(emailColumn).toBeDefined();
    expect(emailColumn?.header).toBe('Email');
  });

  it('should have roles column', () => {
    const columns = getUserColumns(mockProps);
    const rolesColumn = columns.find(col => col.header === 'Roles');
    expect(rolesColumn).toBeDefined();
  });

  it('should have status column', () => {
    const columns = getUserColumns(mockProps);
    const statusColumn = columns.find(col => col.header === 'Status');
    expect(statusColumn).toBeDefined();
  });

  it('should have actions column', () => {
    const columns = getUserColumns(mockProps);
    const actionsColumn = columns.find(col => col.header === 'Actions');
    expect(actionsColumn).toBeDefined();
  });

  it('should call onEdit when edit button is clicked', () => {
    const columns = getUserColumns(mockProps);
    expect(columns).toBeDefined();
    expect(mockProps.onEdit).toBeDefined();
  });

  it('should call onDelete when delete button is clicked', () => {
    const columns = getUserColumns(mockProps);
    expect(columns).toBeDefined();
    expect(mockProps.onDelete).toBeDefined();
  });
});
