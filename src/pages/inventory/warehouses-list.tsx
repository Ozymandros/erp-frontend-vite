"use client";


import { warehousesService } from "@/api/services/warehouses.service";
import type { WarehouseDto, QuerySpec } from "@/types/api.types";
import { CreateWarehouseDialog } from "@/components/inventory/create-warehouse-dialog";
import { EditWarehouseDialog } from "@/components/inventory/edit-warehouse-dialog";
import { DeleteWarehouseDialog } from "@/components/inventory/delete-warehouse-dialog";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getWarehouseColumns } from "./warehouses.columns";
import { downloadBlob } from "@/lib/export.utils";

export function WarehousesListPage() {
  const fetcher = (qs: QuerySpec) => warehousesService.searchWarehouses(qs);

  const {
    data: warehouses,
    isLoading,
    error,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
    refresh,
  } = useDataTable<WarehouseDto>({
    fetcher,
    initialQuery: {
      searchFields: "name,location",
    },
    resourceName: "warehouses",
  });

  const {
    isCreateOpen,
    setIsCreateOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,
    handleCreated,
    handleUpdated,
    handleDeleted,
  } = useListActions<WarehouseDto>({ refresh });

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob =
        format === "xlsx"
          ? await warehousesService.exportToXlsx()
          : await warehousesService.exportToPdf();

      await downloadBlob(blob, `Warehouses.${format}`);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(getErrorMessage(apiError, `Failed to export warehouses to ${format}`));
    }
  };

  const columns = getWarehouseColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
  });

  return (
    <ListPageLayout
      title="Warehouses"
      description="Manage warehouse locations"
      resourceName="Warehouse"
      data={warehouses}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={handleExport}
      onCreateOpen={() => setIsCreateOpen(true)}
      columns={columns}
      searchPlaceholder="Search by name or location..."
      cardTitle="All Warehouses"
      cardDescription={warehouses ? `${warehouses.total} total warehouses` : "Loading..."}
    >
      <CreateWarehouseDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />

      {editingItem && (
        <EditWarehouseDialog
          warehouse={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={handleUpdated}
        />
      )}

      {deletingItem && (
        <DeleteWarehouseDialog
          warehouse={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onSuccess={handleDeleted}
        />
      )}
    </ListPageLayout>
  );
}
