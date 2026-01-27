"use client";

import { useState, useEffect } from "react";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";
import { suppliersService } from "@/api/services/suppliers.service";
import type { PurchaseOrderDto, SupplierDto, QuerySpec } from "@/types/api.types";
import { CreatePurchaseOrderDialog } from "@/components/purchasing/create-purchase-order-dialog";
import { handleApiError } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getPurchaseOrderColumns } from "./purchase-orders.columns";

export function PurchaseOrdersListPage() {
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);

  const fetcher = (qs: QuerySpec) => purchaseOrdersService.searchPurchaseOrders(qs);

  const {
    data: purchaseOrders,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<PurchaseOrderDto>({
    fetcher,
    initialQuery: {
      pageSize: 20,
      searchFields: "orderNumber",
      sortBy: "orderDate",
      sortDesc: true,
    },
    resourceName: "purchase orders",
  });

  // Permissions
  const { canCreate, canExport } = useModulePermissions("purchasing");

  // Actions
  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<PurchaseOrderDto>({ refresh });

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "PurchaseOrders",
    onExport: (format) =>
      format === "xlsx"
        ? purchaseOrdersService.exportToXlsx()
        : purchaseOrdersService.exportToPdf(),
  });

  const fetchSuppliers = async () => {
    try {
      const data = await suppliersService.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      const apiError = handleApiError(err);
      console.error("Failed to fetch suppliers", apiError);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || supplierId;
  };

  const error = dataError || exportError;
  const columns = getPurchaseOrderColumns({ getSupplierName });

  return (
    <ListPageLayout
      title="Purchase Orders"
      description="Manage purchase orders from suppliers"
      resourceName="Purchase Order"
      data={purchaseOrders}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search by order number, supplier..."
      cardTitle="All Purchase Orders"
      cardDescription={purchaseOrders ? `${purchaseOrders.total} total orders` : "Loading..."}
    >
      <CreatePurchaseOrderDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />
    </ListPageLayout>
  );
}
