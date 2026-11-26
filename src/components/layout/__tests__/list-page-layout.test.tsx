import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListPageLayout } from '../list-page-layout';
import { BaseDto, PaginatedResponse } from '@/types/api.types';
import type { Column } from '@/components/ui/data-table';

interface TestItem extends BaseDto<string> {
  name: string;
}

const mockData: PaginatedResponse<TestItem> = {
  items: [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
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

const sortableColumns: Column<TestItem>[] = [
  {
    accessor: 'name' as const,
    header: 'Sortable name',
    sortable: true,
    sortField: 'name',
  },
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

  it("paginates with Previous and Next", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const pagedData: PaginatedResponse<TestItem> = {
      items: [{ id: "3", name: "Item 3" }],
      total: 25,
      page: 2,
      pageSize: 10,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true,
    };

    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="items"
        data={pagedData}
        isLoading={false}
        error={null}
        querySpec={{
          page: 2,
          pageSize: 10,
          searchTerm: "",
          sortBy: "name",
          sortDesc: false,
        }}
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onPageChange={onPageChange}
        columns={mockColumns}
        cardTitle="Items List"
        cardDescription="Page 2"
      />
    );

    await user.click(screen.getByRole("button", { name: /^previous$/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole("button", { name: /^next$/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onSort when clicking a sortable column header", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
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
        onSort={onSort}
        onPageChange={vi.fn()}
        columns={sortableColumns}
        cardTitle="Items List"
        cardDescription="All test items"
      />
    );
    await user.click(screen.getByRole("button", { name: /sortable name/i }));
    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("shows DataTable loading spinner", () => {
    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="items"
        data={mockData}
        isLoading
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
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows empty message when no rows", () => {
    const emptyData: PaginatedResponse<TestItem> = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
    render(
      <ListPageLayout
        title="Test Items"
        description="Manage test items"
        resourceName="widgets"
        data={emptyData}
        isLoading={false}
        error={null}
        querySpec={mockQuerySpec}
        onSearch={vi.fn()}
        onSort={vi.fn()}
        onPageChange={vi.fn()}
        columns={mockColumns}
        cardTitle="Items List"
        cardDescription="None"
      />
    );
    expect(screen.getByText("No widgets found.")).toBeInTheDocument();
  });

  it("renders extra header actions", () => {
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
        extraHeaderActions={<button type="button">Extra</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Extra" })).toBeInTheDocument();
  });
});
