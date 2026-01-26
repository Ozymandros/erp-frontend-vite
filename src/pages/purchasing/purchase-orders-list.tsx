"use client";

import { useState, useEffect } from "react";
import { purchaseOrdersService } from "@/api/services/purchase-orders.service";
import { suppliersService } from "@/api/services/suppliers.service";
import type { PurchaseOrderDto, SupplierDto, QuerySpec } from "@/types/api.types";
import { CreatePurchaseOrderDialog } from "@/components/purchasing/create-purchase-order-dialog";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getPurchaseOrderColumns } from "./purchase-orders.columns";
import { downloadBlob } from "@/lib/export.utils";

export function PurchaseOrdersListPage() {
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);

  const fetcher = (qs: QuerySpec) => purchaseOrdersService.searchPurchaseOrders(qs);

  const {
    data: purchaseOrders,
    isLoading,
    error,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
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

  const {
    isCreateOpen,
    setIsCreateOpen,
    handleCreated,
  } = useListActions<PurchaseOrderDto>({ refresh });

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

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob =
        format === "xlsx"
          ? await purchaseOrdersService.exportToXlsx()
          : await purchaseOrdersService.exportToPdf();

      await downloadBlob(blob, `PurchaseOrders.${format}`);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(getErrorMessage(apiError, `Failed to export purchase orders to ${format}`));
    }
  };

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
      onExport={handleExport}
      onCreateOpen={() => setIsCreateOpen(true)}
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
