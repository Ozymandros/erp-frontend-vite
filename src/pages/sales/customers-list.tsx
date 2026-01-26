"use client";


import { customersService } from "@/api/services/customers.service";
import type { CustomerDto, QuerySpec } from "@/types/api.types";
import { CreateCustomerDialog } from "@/components/sales/create-customer-dialog";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { customerColumns } from "./customers.columns";
import { downloadBlob } from "@/lib/export.utils";

export function CustomersListPage() {
  const fetcher = (qs: QuerySpec) => customersService.searchCustomers(qs);

  const {
    data: customers,
    isLoading,
    error,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
    refresh,
  } = useDataTable<CustomerDto>({
    fetcher,
    initialQuery: {
      searchFields: "name,email",
    },
    resourceName: "customers",
  });

  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<CustomerDto>({ refresh });

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob =
        format === "xlsx"
          ? await customersService.exportToXlsx()
          : await customersService.exportToPdf();

      await downloadBlob(blob, `Customers.${format}`);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(getErrorMessage(apiError, `Failed to export customers to ${format}`));
    }
  };

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
      onExport={handleExport}
      onCreateOpen={() => setIsCreateOpen(true)}
      columns={customerColumns}
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
