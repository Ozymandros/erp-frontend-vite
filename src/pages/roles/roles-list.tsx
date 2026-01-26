"use client"

import React from "react"
import { rolesService } from "@/api/services/roles.service"
import type { Role } from "@/types/api.types"
import { CreateRoleDialog } from "@/components/roles/create-role-dialog"
import { EditRoleDialog } from "@/components/roles/edit-role-dialog"
import { DeleteRoleDialog } from "@/components/roles/delete-role-dialog"
import { handleApiError, getErrorMessage } from "@/lib/error-handling"
import { useDataTable } from "@/hooks/use-data-table"
import { useListActions } from "@/hooks/use-list-actions"
import { ListPageLayout } from "@/components/layout/list-page-layout"
import { getRoleColumns } from "./roles.columns"
import { downloadBlob } from "@/lib/export.utils"

export function RolesListPage() {
  const {
    data: roles,
    isLoading,
    error,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
    refresh,
  } = useDataTable<Role>({
    fetcher: (qs) =>
      rolesService.getRolesPaginated({
        page: qs.page || 1,
        pageSize: qs.pageSize || 10,
        search: qs.searchTerm || undefined,
      }),
    resourceName: "roles",
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
  } = useListActions<Role>({ refresh })

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob = format === "xlsx" ? await rolesService.exportToXlsx() : await rolesService.exportToPdf()
      await downloadBlob(blob, `Roles.${format}`)
    } catch (error) {
      const apiError = handleApiError(error)
      setError(getErrorMessage(apiError, `Failed to export roles to ${format}`))
    }
  }

  const columns = getRoleColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
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
      onExport={handleExport}
      onCreateOpen={() => setIsCreateOpen(true)}
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
