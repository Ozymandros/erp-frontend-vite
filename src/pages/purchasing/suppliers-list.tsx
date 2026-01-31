"use client";

import { suppliersService } from "@/api/services/suppliers.service";
import type { SupplierDto, QuerySpec } from "@/types/api.types";
import { CreateSupplierDialog } from "@/components/purchasing/create-supplier-dialog";
import { EditSupplierDialog } from "@/components/purchasing/edit-supplier-dialog";
import { DeleteSupplierDialog } from "@/components/purchasing/delete-supplier-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getSupplierColumns } from "./suppliers.columns";

export function SuppliersListPage() {
  const fetcher = (qs: QuerySpec) =>
    suppliersService.advancedSearchSuppliers({
      page: qs.page || 1,
      pageSize: qs.pageSize || 10,
      searchTerm: qs.searchTerm,
      searchFields: "name,email",
      sortBy: qs.sortBy ?? "createdAt",
      sortDesc: qs.sortDesc ?? true,
      filters: qs.filters,
    });

  const {
    data: suppliers,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<SupplierDto>({
    fetcher,
    resourceName: "suppliers",
  });

  const { canCreate, canUpdate, canDelete, canExport } = useModulePermissions("purchasing");

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
  } = useListActions<SupplierDto>({ refresh });

  const { handleExport, exportError } = useExport({
    resourceName: "Suppliers",
    onExport: (format) =>
      format === "xlsx"
        ? suppliersService.exportToXlsx()
        : suppliersService.exportToPdf(),
  });

  const error = dataError || exportError;

  const columns = getSupplierColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
    canEdit: canUpdate,
    canDelete: canDelete,
  });

  return (
    <ListPageLayout
      title="Suppliers"
      description="Manage suppliers for purchase orders"
      resourceName="Supplier"
      data={suppliers}
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
      cardTitle="All Suppliers"
      cardDescription={suppliers ? `${suppliers.total} total suppliers` : "Loading..."}
    >
      <CreateSupplierDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />

      {editingItem && (
        <EditSupplierDialog
          supplier={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={handleUpdated}
        />
      )}

      {deletingItem && (
        <DeleteSupplierDialog
          supplier={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onSuccess={handleDeleted}
        />
      )}
    </ListPageLayout>
  );
}
