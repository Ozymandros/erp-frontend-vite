import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getCustomerColumns } from '../customers.columns';
import type { CustomerDto } from '@/types/api.types';

describe('Customers Columns', () => {
  const mockCustomer: CustomerDto = {
    id: 'cust1',
    name: 'Test Customer',
    email: 'cust@test.com',
    phoneNumber: '555-9999',
    address: '456 Ave',
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  };

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

  it('should have email column showing email or dash', () => {
    const columns = getCustomerColumns();
    const emailCol = columns.find(col => col.header === 'Email');
    const accessor = emailCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockCustomer)}</MemoryRouter>);
      expect(container).toHaveTextContent('cust@test.com');
    }
  });

  it('should have phone column showing phone or dash', () => {
    const columns = getCustomerColumns();
    const phoneCol = columns.find(col => col.header === 'Phone');
    const accessor = phoneCol?.accessor;
    if (typeof accessor === 'function') {
      const { container } = render(<MemoryRouter>{accessor(mockCustomer)}</MemoryRouter>);
      expect(container).toHaveTextContent('555-9999');
    }
  });

  it('should have actions column with view link', () => {
    const columns = getCustomerColumns();
    const actionsCol = columns.find(col => col.header === 'Actions');
    const accessor = actionsCol?.accessor;
    if (typeof accessor === 'function') {
      render(<MemoryRouter>{accessor(mockCustomer)}</MemoryRouter>);
      expect(screen.getByTitle('View Details')).toBeInTheDocument();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/sales/customers/cust1');
    }
  });
});
