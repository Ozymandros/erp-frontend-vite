"use client";

import React from "react";
import { usersService } from "@/api/services/users.service";
import type { User } from "@/types/api.types";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getUserColumns } from "./users.columns";
import { downloadBlob } from "@/lib/export.utils";

export function UsersListPage() {
  const {
    data: users,
    isLoading,
    error,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
    refresh,
  } = useDataTable<User>({
    fetcher: (qs) => usersService.searchUsers(qs),
    initialQuery: {
      searchFields: "username,email,firstName,lastName",
    },
    resourceName: "users",
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
  } = useListActions<User>({ refresh });

  const handleExport = async (format: "xlsx" | "pdf") => {
    try {
      const blob =
        format === "xlsx"
          ? await usersService.exportToXlsx()
          : await usersService.exportToPdf();

      await downloadBlob(blob, `Users.${format}`);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(getErrorMessage(apiError, `Failed to export users to ${format}`));
    }
  };

  const columns = getUserColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
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
      onExport={handleExport}
      onCreateOpen={() => setIsCreateOpen(true)}
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
