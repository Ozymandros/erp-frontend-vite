"use client";

import { useState, useEffect } from "react";
import { ordersService } from "@/api/services/orders.service";
import { customersService } from "@/api/services/customers.service";
import type { OrderDto, CustomerDto, QuerySpec } from "@/types/api.types";
import { CreateOrderDialog } from "@/components/orders/create-order-dialog";
import { handleApiError } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getOrderColumns } from "./orders.columns";

export function OrdersListPage() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);

  const fetcher = async (_qs: QuerySpec) => {
    const items = await ordersService.getOrders();
    return {
      items,
      page: 1,
      pageSize: items.length,
      total: items.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  };

  const {
    data: ordersResponse,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<OrderDto>({
    fetcher,
    resourceName: "orders",
  });

  // Permissions
  const { canCreate, canExport } = useModulePermissions("orders");

  // Actions
  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<OrderDto>({ refresh });

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "Orders",
    onExport: (format) =>
      format === "xlsx"
        ? ordersService.exportToXlsx()
        : ordersService.exportToPdf(),
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
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || customerId;
  };

  const error = dataError || exportError;
  const columns = getOrderColumns({
    getCustomerName,
  });

  return (
    <ListPageLayout
      title="Orders"
      description="Manage fulfillment orders"
      resourceName="Order"
      data={ordersResponse}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      cardTitle="All Orders"
      cardDescription={ordersResponse ? `${ordersResponse.total} total orders` : "Loading..."}
    >
      <CreateOrderDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onSuccess={handleCreated} 
      />
    </ListPageLayout>
  );
}
