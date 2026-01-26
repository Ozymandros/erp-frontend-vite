"use client";

import { useState, useEffect } from "react";
import { salesOrdersService } from "@/api/services/sales-orders.service";
import { customersService } from "@/api/services/customers.service";
import type { SalesOrderDto, CustomerDto, QuerySpec } from "@/types/api.types";
import { CreateSalesOrderDialog } from "@/components/sales/create-sales-order-dialog";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getSalesOrderColumns } from "./sales-orders.columns";
import { downloadBlob } from "@/lib/export.utils";

export function SalesOrdersListPage() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);

  const fetcher = (qs: QuerySpec) => salesOrdersService.searchSalesOrders(qs);

  const {
    data: salesOrders,
    isLoading,
    error,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
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

  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<SalesOrderDto>({ refresh });

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

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob =
        format === "xlsx"
          ? await salesOrdersService.exportToXlsx()
          : await salesOrdersService.exportToPdf();

      await downloadBlob(blob, `SalesOrders.${format}`);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(getErrorMessage(apiError, `Failed to export sales orders to ${format}`));
    }
  };

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
      onExport={handleExport}
      onCreateOpen={() => setIsCreateOpen(true)}
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
