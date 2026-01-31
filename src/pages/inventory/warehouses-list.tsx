"use client";

import { warehousesService } from "@/api/services/warehouses.service";
import type { WarehouseDto, QuerySpec } from "@/types/api.types";
import { CreateWarehouseDialog } from "@/components/inventory/create-warehouse-dialog";
import { EditWarehouseDialog } from "@/components/inventory/edit-warehouse-dialog";
import { DeleteWarehouseDialog } from "@/components/inventory/delete-warehouse-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getWarehouseColumns } from "./warehouses.columns";

export function WarehousesListPage() {
  const fetcher = (qs: QuerySpec) => warehousesService.searchWarehouses(qs);

  const {
    data: warehouses,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<WarehouseDto>({
    fetcher,
    initialQuery: {
      searchFields: "name,location",
    },
    resourceName: "warehouses",
  });

  // Permissions
  const { canCreate, canUpdate, canDelete, canExport } = useModulePermissions("warehouses");

  // Actions
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

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "Warehouses",
    onExport: (format) =>
      format === "xlsx"
        ? warehousesService.exportToXlsx()
        : warehousesService.exportToPdf(),
  });

  const error = dataError || exportError;

  const columns = getWarehouseColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
    canEdit: canUpdate,
    canDelete: canDelete,
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
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
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
