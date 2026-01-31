"use client"

import { permissionsService } from "@/api/services/permissions.service"
import type { Permission, QuerySpec } from "@/types/api.types"
import { CreatePermissionDialog } from "@/components/permissions/create-permission-dialog"
import { EditPermissionDialog } from "@/components/permissions/edit-permission-dialog"
import { DeletePermissionDialog } from "@/components/permissions/delete-permission-dialog"
import { useDataTable } from "@/hooks/use-data-table"
import { useListActions } from "@/hooks/use-list-actions"
import { useModulePermissions } from "@/hooks/use-permissions"
import { useExport } from "@/hooks/use-export"
import { ListPageLayout } from "@/components/layout/list-page-layout"
import { getPermissionColumns } from "./permissions.columns"
import { PermissionFilterHeader } from "@/components/permissions/permission-filter-header"

export function PermissionsListPage() {
  const fetcher = (qs: QuerySpec) =>
    permissionsService.searchPermissions({
      page: qs.page || 1,
      pageSize: qs.pageSize || 10,
      searchTerm: qs.searchTerm,
      searchFields: "module,action,description",
      sortBy: qs.sortBy || "module",
      sortDesc: qs.sortDesc ?? false,
      filters: qs.filters,
    });

  const {
    data: permissions,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<Permission>({
    fetcher,
    resourceName: "permissions",
  })

  // Permissions
  const { canCreate, canUpdate, canDelete, canExport } = useModulePermissions("permissions");

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
  } = useListActions<Permission>({ refresh });

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "Permissions",
    onExport: (format) =>
      format === "xlsx"
        ? permissionsService.exportToXlsx()
        : permissionsService.exportToPdf(),
  });

  const error = dataError || exportError;

  const columns = getPermissionColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
    canEdit: canUpdate,
    canDelete: canDelete,
  })

  return (
    <ListPageLayout
      title="Permissions"
      description="Manage system permissions and access controls"
      resourceName="Permission"
      data={permissions}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={(val) => handleSearch(val)}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      cardTitle="All Permissions"
      cardDescription="A list of all permissions in the system"
      extraHeaderActions={<PermissionFilterHeader onFilterChange={(f) => handleSearch(f.search || "")} />}
    >
      <CreatePermissionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={handleCreated} />

      {editingItem && (
        <EditPermissionDialog
          permission={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={handleUpdated}
        />
      )}

      {deletingItem && (
        <DeletePermissionDialog
          permission={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onSuccess={handleDeleted}
        />
      )}
    </ListPageLayout>
  )
}
