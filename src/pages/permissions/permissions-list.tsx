"use client"

import React from "react"
import { permissionsService } from "@/api/services/permissions.service"
import type { Permission } from "@/types/api.types"
import { CreatePermissionDialog } from "@/components/permissions/create-permission-dialog"
import { EditPermissionDialog } from "@/components/permissions/edit-permission-dialog"
import { DeletePermissionDialog } from "@/components/permissions/delete-permission-dialog"
import { handleApiError, getErrorMessage } from "@/lib/error-handling"
import { useDataTable } from "@/hooks/use-data-table"
import { useListActions } from "@/hooks/use-list-actions"
import { ListPageLayout } from "@/components/layout/list-page-layout"
import { getPermissionColumns } from "./permissions.columns"
import { downloadBlob } from "@/lib/export.utils"
import { PermissionFilterHeader } from "@/components/permissions/permission-filter-header"

export function PermissionsListPage() {
  const {
    data: permissions,
    isLoading,
    error,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
    refresh,
  } = useDataTable<Permission>({
    fetcher: (qs) =>
      permissionsService.getPermissionsPaginated({
        page: qs.page || 1,
        pageSize: qs.pageSize || 10,
        search: qs.searchTerm || undefined,
      }),
    resourceName: "permissions",
  })

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
  } = useListActions<Permission>({ refresh })

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob = format === "xlsx" ? await permissionsService.exportToXlsx() : await permissionsService.exportToPdf()
      await downloadBlob(blob, `Permissions.${format}`)
    } catch (err: unknown) {
      const apiError = handleApiError(err)
      setError(getErrorMessage(apiError, `Failed to export permissions to ${format}`))
    }
  }

  const columns = getPermissionColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
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
      onExport={handleExport}
      onCreateOpen={() => setIsCreateOpen(true)}
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
