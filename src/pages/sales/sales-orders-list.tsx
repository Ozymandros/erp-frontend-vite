"use client";

import { useState, useEffect } from "react";
import { salesOrdersService } from "@/api/services/sales-orders.service";
import { customersService } from "@/api/services/customers.service";
import type { SalesOrderDto, CustomerDto, QuerySpec } from "@/types/api.types";
import { CreateSalesOrderDialog } from "@/components/sales/create-sales-order-dialog";
import { handleApiError } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getSalesOrderColumns } from "./sales-orders.columns";

export function SalesOrdersListPage() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);

  const fetcher = (qs: QuerySpec) => salesOrdersService.searchSalesOrders(qs);

  const {
    data: salesOrders,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<SalesOrderDto>({
    fetcher,
    initialQuery: {
      pageSize: 20,
      searchFields: "orderNumber",
      sortBy: "orderDate",
      sortDesc: true,
    },
    resourceName: "sales orders",
  });

  // Permissions
  const { canCreate, canExport } = useModulePermissions("sales");

  // Actions
  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<SalesOrderDto>({ refresh });

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "SalesOrders",
    onExport: (format) =>
      format === "xlsx"
        ? salesOrdersService.exportToXlsx()
        : salesOrdersService.exportToPdf(),
  });

  const fetchCustomers = async () => {
    try {
      const data = await customersService.getCustomers();
      setCustomers(data);
    } catch (err) {
      const apiError = handleApiError(err);
      console.error("Failed to fetch customers", apiError);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || customerId;
  };

  const error = dataError || exportError;
  const columns = getSalesOrderColumns({ getCustomerName });

  return (
    <ListPageLayout
      title="Sales Orders"
      description="Manage sales orders and quotes"
      resourceName="Order"
      data={salesOrders}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search by order number, customer..."
      cardTitle="All Sales Orders"
      cardDescription={salesOrders ? `${salesOrders.total} total orders` : "Loading..."}
    >
      <CreateSalesOrderDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />
    </ListPageLayout>
  );
}
