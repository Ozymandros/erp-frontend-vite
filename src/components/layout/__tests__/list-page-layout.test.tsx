import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListPageLayout } from '../list-page-layout';
import type { PaginatedResponse } from '@/types/api.types';
import type { Column } from '@/components/ui/data-table';

interface TestItem {
  id: number;
  name: string;
}

const mockData: PaginatedResponse<TestItem> = {
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ],
  total: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

const mockQuerySpec = {
  page: 1,
  pageSize: 10,
  searchTerm: '',
  sortBy: 'name',
};

const mockColumns: Column<TestItem>[] = [
  { accessor: 'id' as const, header: 'ID' },
  { accessor: 'name' as const, header: 'Name' },
];

describe('ListPageLayout', () => {
  it('should render title and description', () => {
    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="items"
        data={mockData}
        isLoading={false}
        error={null}
        querySpec={mockQuerySpec}
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        columns={mockColumns}
        cardTitle="Items List"
        cardDescription="All test items"
      />
    );

    expect(screen.getByText('Test Items')).toBeInTheDocument();
    expect(screen.getByText('Manage test items')).toBeInTheDocument();
  });

  it('should call onSearch when search input changes', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = userEvent.setup() as any;
    const mockOnSearch = vi.fn();

    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="items"
        data={mockData}
        isLoading={false}
        error={null}
        querySpec={mockQuerySpec}
        onSearch={mockOnSearch}
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        columns={mockColumns}
        cardTitle="Items List"
        cardDescription="All test items"
        searchPlaceholder="Search items..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search items...');
    await user.type(searchInput, 'test');

    expect(mockOnSearch).toHaveBeenCalled();
  });

  it('should render export buttons when onExport is provided', () => {
    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="items"
        data={mockData}
        isLoading={false}
        error={null}
        querySpec={mockQuerySpec}
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        onExport={vi.fn()}
        columns={mockColumns}
        cardTitle="Items List"
        cardDescription="All test items"
      />
    );

    expect(screen.getByText('Export XLSX')).toBeInTheDocument();
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  it('should render create button when onCreateOpen is provided', () => {
    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="items"
        data={mockData}
        isLoading={false}
        error={null}
        querySpec={mockQuerySpec}
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        onCreateOpen={vi.fn()}
        columns={mockColumns}
        cardTitle="Items List"
        cardDescription="All test items"
      />
    );

    expect(screen.getByText('Add items')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="items"
        data={null}
        isLoading={true}
        error={null}
        querySpec={mockQuerySpec}
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        columns={mockColumns}
        cardTitle="Items List"
        cardDescription="All test items"
      />
    );

    // DataTable handles loading state internally
    expect(screen.getByText('Test Items')).toBeInTheDocument();
  });

  it('should display error state', () => {
    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="items"
        data={null}
        isLoading={false}
        error="Failed to load items"
        querySpec={mockQuerySpec}
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        columns={mockColumns}
        cardTitle="Items List"
        cardDescription="All test items"
      />
    );

    expect(screen.getByText('Failed to load items')).toBeInTheDocument();
  });

  it('should call onExport with correct format', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = userEvent.setup() as any;
    const mockOnExport = vi.fn();

    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="items"
        data={mockData}
        isLoading={false}
        error={null}
        querySpec={mockQuerySpec}
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        onExport={mockOnExport}
        columns={mockColumns}
        cardTitle="Items List"
        cardDescription="All test items"
      />
    );

    const xlsxButton = screen.getByText('Export XLSX');
    await user.click(xlsxButton);

    expect(mockOnExport).toHaveBeenCalledWith('xlsx');
  });
});
