"use client";

import { usersService } from "@/api/services/users.service";
import type { User, QuerySpec } from "@/types/api.types";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getUserColumns } from "./users.columns";

export function UsersListPage() {
  const fetcher = (qs: QuerySpec) => usersService.searchUsers(qs);

  const {
    data: users,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<User>({
    fetcher,
    initialQuery: {
      searchFields: "username,email,firstName,lastName",
    },
    resourceName: "users",
  });

  // Permissions
  const { canCreate, canUpdate, canDelete, canExport } = useModulePermissions("users");
  const canManageRoles = canUpdate; // Managing roles requires update permission

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
  } = useListActions<User>({ refresh });

  // Export
  const { handleExport, exportError } = useExport({
    resourceName: "Users",
    onExport: (format) =>
      format === "xlsx"
        ? usersService.exportToXlsx()
        : usersService.exportToPdf(),
  });

  const error = dataError || exportError;

  const columns = getUserColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
    canEdit: canUpdate,
    canDelete: canDelete,
    canManageRoles: canManageRoles,
  });

  return (
    <ListPageLayout
      title="Users"
      description="Manage system users and their roles"
      resourceName="User"
      data={users}
      isLoading={isLoading}
      error={error}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search users by username, email, or name..."
      cardTitle="All Users"
      cardDescription="A list of all users in the system"
    >
      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />

      {editingItem && (
        <EditUserDialog
          user={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={handleUpdated}
        />
      )}

      {deletingItem && (
        <DeleteUserDialog
          user={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onSuccess={handleDeleted}
        />
      )}
    </ListPageLayout>
  );
}
