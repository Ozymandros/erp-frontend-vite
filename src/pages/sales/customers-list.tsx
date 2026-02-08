"use client";

import { customersService } from "@/api/services/customers.service";
import type { CustomerDto, QuerySpec } from "@/types/api.types";
import { CreateCustomerDialog } from "@/components/sales/create-customer-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getCustomerColumns } from "./customers.columns";

export function CustomersListPage() {
  const fetcher = (qs: QuerySpec) => customersService.searchCustomers(qs);

  const {
    data: customers,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<CustomerDto>({
    fetcher,
    initialQuery: {
      searchFields: "name,email",
    },
    resourceName: "customers",
  });

  // Permissions
  const { canCreate, canExport } = useModulePermissions("customers");

  // Actions
  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<CustomerDto>({ refresh });

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "Customers",
    onExport: (format) =>
      format === "xlsx"
        ? customersService.exportToXlsx()
        : customersService.exportToPdf(),
  });

  const error = dataError || exportError;
  const columns = getCustomerColumns();

  return (
    <ListPageLayout
      title="Customers"
      description="Manage your customers"
      resourceName="Customer"
      data={customers}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search by name or email..."
      cardTitle="All Customers"
      cardDescription={customers ? `${customers.total} total customers` : "Loading..."}
    >
      <CreateCustomerDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />
    </ListPageLayout>
  );
}
