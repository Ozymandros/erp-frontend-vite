"use client";

import { useMemo } from "react";
import { invoicesService } from "@/api/services/invoices.service";
import type { InvoiceDto, InvoiceStatus, QuerySpec } from "@/types/api.types";
import { CreateInvoiceDialog } from "@/components/billing/create-invoice-dialog";
import { InvoiceFilterHeader } from "@/components/billing/invoice-filter-header";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { useDataTable } from "@/hooks/use-data-table";
import { useExport } from "@/hooks/use-export";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { getInvoiceColumns } from "./invoices.columns";

export function InvoicesListPage() {
  const fetcher = async (querySpec: QuerySpec) => {
    return invoicesService.searchInvoices({
      page: querySpec.page || 1,
      pageSize: querySpec.pageSize || 20,
      searchTerm: querySpec.searchTerm,
      searchFields:
        querySpec.searchFields ||
        "invoiceNumber,customerId,orderId,currency,status",
      sortBy: querySpec.sortBy || "createdAt",
      sortDesc: querySpec.sortDesc ?? true,
      filters: querySpec.filters,
    });
  };

  const {
    data: invoices,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setQuerySpec,
    refresh,
  } = useDataTable<InvoiceDto>({
    fetcher,
    initialQuery: {
      pageSize: 20,
      searchFields: "invoiceNumber,status",
      sortBy: "createdAt",
      sortDesc: true,
    },
    resourceName: "invoices",
  });

  const { canCreate, canExport } = useModulePermissions("billing");
  const { isCreateOpen, setIsCreateOpen, handleCreated } = useListActions<InvoiceDto>({
    refresh,
  });
  const { handleExport, exportError } = useExport({
    resourceName: "Invoices",
    onExport: (format) =>
      format === "xlsx"
        ? invoicesService.exportToXlsx()
        : invoicesService.exportToPdf(),
  });

  const columns = useMemo(() => getInvoiceColumns(), []);
  const error = dataError || exportError;

  const handleStatusFilterChange = (status?: InvoiceStatus) => {
    setQuerySpec((prev) => ({
      ...prev,
      page: 1,
      filters: {
        ...prev.filters,
        status: status ?? "",
      },
    }));
  };

  return (
    <ListPageLayout
      title="Invoices"
      description="Manage customer invoices and billing actions"
      resourceName="Invoice"
      data={invoices}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search by invoice number, status, currency..."
      cardTitle="All Invoices"
      cardDescription={invoices ? `${invoices.total} total invoices` : "Loading..."}
      extraHeaderActions={
        <InvoiceFilterHeader
          status={querySpec.filters?.status}
          onStatusChange={handleStatusFilterChange}
        />
      }
    >
      <CreateInvoiceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />
    </ListPageLayout>
  );
}
