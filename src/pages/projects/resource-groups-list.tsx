import { useCallback } from "react";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import type { QuerySpec, ResourceGroupDto } from "@/types/api.types";
import { paginateArray } from "@/lib/projects/array-pagination";
import { CreateResourceGroupDialog } from "@/components/projects/create-resource-group-dialog";
import { EditResourceGroupDialog } from "@/components/projects/edit-resource-group-dialog";
import { DeleteResourceGroupDialog } from "@/components/projects/delete-resource-group-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { Link } from "react-router-dom";
import { Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export function ResourceGroupsListPage() {
  const fetcher = useCallback(async (qs: QuerySpec) => {
    const all = await projectResourceGroupsService.getResourceGroups();
    return paginateArray(all, qs, (item, term) =>
      `${item.code} ${item.name}`.toLowerCase().includes(term)
    );
  }, []);

  const table = useDataTable<ResourceGroupDto>({
    fetcher,
    resourceName: "resource groups",
  });

  const { canCreate, canUpdate, canDelete } = useModulePermissions("projects");
  const actions = useListActions<ResourceGroupDto>({ refresh: table.refresh });

  const columns: Column<ResourceGroupDto>[] = [
    {
      header: "Code",
      accessor: (g) => (
        <Link
          to={`/projects/resource-groups/${g.id}`}
          className="text-primary hover:underline font-medium"
        >
          {g.code}
        </Link>
      ),
    },
    { header: "Name", accessor: (g) => g.name },
    {
      header: "Actions",
      accessor: (g) => (
        <div className="flex gap-1">
          {canUpdate ? (
            <Button variant="ghost" size="icon" onClick={() => actions.setEditingItem(g)}>
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          {canDelete ? (
            <Button variant="ghost" size="icon" onClick={() => actions.setDeletingItem(g)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <ListPageLayout
      title="Resource Groups"
      description="Group project resources"
      resourceName="Resource Group"
      data={table.data}
      isLoading={table.isLoading}
      error={table.error}
      querySpec={table.querySpec}
      onSearch={table.handleSearch}
      onSort={table.handleSort}
      onPageChange={table.handlePageChange}
      onCreateOpen={canCreate ? () => actions.setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search groups…"
      cardTitle="Resource Groups"
      cardDescription={
        table.data ? `${table.data.total} groups` : "Loading..."
      }
    >
      <CreateResourceGroupDialog
        open={actions.isCreateOpen}
        onOpenChange={actions.setIsCreateOpen}
        onSuccess={actions.handleCreated}
      />
      {actions.editingItem ? (
        <EditResourceGroupDialog
          group={actions.editingItem}
          open={!!actions.editingItem}
          onOpenChange={(open) => !open && actions.setEditingItem(null)}
          onSuccess={actions.handleUpdated}
        />
      ) : null}
      {actions.deletingItem ? (
        <DeleteResourceGroupDialog
          group={actions.deletingItem}
          open={!!actions.deletingItem}
          onOpenChange={(open) => !open && actions.setDeletingItem(null)}
          onSuccess={actions.handleDeleted}
        />
      ) : null}
    </ListPageLayout>
  );
}
