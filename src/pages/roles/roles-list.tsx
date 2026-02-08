"use client"

import { rolesService } from "@/api/services/roles.service"
import type { Role, QuerySpec } from "@/types/api.types"
import { CreateRoleDialog } from "@/components/roles/create-role-dialog"
import { EditRoleDialog } from "@/components/roles/edit-role-dialog"
import { DeleteRoleDialog } from "@/components/roles/delete-role-dialog"
import { useDataTable } from "@/hooks/use-data-table"
import { useListActions } from "@/hooks/use-list-actions"
import { useModulePermissions } from "@/hooks/use-permissions"
import { useExport } from "@/hooks/use-export"
import { ListPageLayout } from "@/components/layout/list-page-layout"
import { getRoleColumns } from "./roles.columns"

export function RolesListPage() {
  const fetcher = (qs: QuerySpec) =>
    rolesService.searchRoles({
      page: qs.page || 1,
      pageSize: qs.pageSize || 10,
      searchTerm: qs.searchTerm,
      searchFields: "name,description",
      sortBy: qs.sortBy || "createdAt",
      sortDesc: qs.sortDesc ?? true,
      filters: qs.filters,
    });

  const {
    data: roles,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<Role>({
    fetcher,
    resourceName: "roles",
  })

  // Permissions
  const { canCreate, canUpdate, canDelete, canExport } = useModulePermissions("roles");
  const canManagePermissions = canUpdate; // Managing permissions requires update permission

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
  } = useListActions<Role>({ refresh });

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "Roles",
    onExport: (format) =>
      format === "xlsx"
        ? rolesService.exportToXlsx()
        : rolesService.exportToPdf(),
  });

  const error = dataError || exportError;

  const columns = getRoleColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
    canEdit: canUpdate,
    canDelete: canDelete,
    canManagePermissions: canManagePermissions,
  })

  return (
    <ListPageLayout
      title="Roles"
      description="Manage user roles and their permissions"
      resourceName="Role"
      data={roles}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search roles by name..."
      cardTitle="All Roles"
      cardDescription="A list of all roles in the system"
    >
      <CreateRoleDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={handleCreated} />

      {editingItem && (
        <EditRoleDialog
          role={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={handleUpdated}
        />
      )}

      {deletingItem && (
        <DeleteRoleDialog
          role={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onSuccess={handleDeleted}
        />
      )}
    </ListPageLayout>
  )
}
