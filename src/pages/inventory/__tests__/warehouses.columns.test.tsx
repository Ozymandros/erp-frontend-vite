import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
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

  it('should have location column showing location or dash', () => {
    const columns = getWarehouseColumns(mockProps);
    const locCol = columns.find(col => col.header === 'Location');
    expect(locCol).toBeDefined();
    const accessor = locCol?.accessor;
    const mockWh = { id: 'wh1', name: 'Main WH', location: 'Building A', createdAt: '2024-01-01', createdBy: 'admin' };
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockWh)}</MemoryRouter>);
      expect(container).toHaveTextContent('Building A');
    }
  });

  it('should show dash when location is empty', () => {
    const columns = getWarehouseColumns(mockProps);
    const locCol = columns.find(col => col.header === 'Location');
    const whNoLoc = { id: 'wh1', name: 'Main WH', location: '', createdAt: '2024-01-01', createdBy: 'admin' };
    const accessor = locCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(whNoLoc)}</MemoryRouter>);
      expect(container).toHaveTextContent('-');
    }
  });

  it('should have actions column with Edit and Delete', async () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    const columns = getWarehouseColumns({ ...mockProps, onEdit: mockOnEdit, onDelete: mockOnDelete });
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    const mockWh = { id: 'wh1', name: 'Main WH', location: 'A', createdAt: '2024-01-01', createdBy: 'admin' };
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockWh)}</MemoryRouter>);
      await userEvent.click(screen.getByTitle('Edit Warehouse'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockWh);
      await userEvent.click(screen.getByTitle('Delete Warehouse'));
      expect(mockOnDelete).toHaveBeenCalledWith(mockWh);
    }
  });
});
