import { projectResourcesService } from "@/api/services/project-resources.service";
import type { QuerySpec, ResourceDto } from "@/types/api.types";
import { CreateResourceDialog } from "@/components/projects/create-resource-dialog";
import { EditResourceDialog } from "@/components/projects/edit-resource-dialog";
import { DeleteResourceDialog } from "@/components/projects/delete-resource-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getResourceColumns } from "./resources.columns";

export function ResourcesListPage() {
  const fetcher = (qs: QuerySpec) =>
    projectResourcesService.searchResources({
      page: qs.page || 1,
      pageSize: qs.pageSize || 10,
      searchTerm: qs.searchTerm,
      searchFields: "name,resourceNo",
      sortBy: qs.sortBy ?? "createdAt",
      sortDesc: qs.sortDesc ?? true,
    });

  const table = useDataTable<ResourceDto>({
    fetcher,
    resourceName: "resources",
  });

  const { canCreate, canUpdate, canDelete, canExport } =
    useModulePermissions("projects");

  const actions = useListActions<ResourceDto>({ refresh: table.refresh });

  const { handleExport, exportError } = useExport({
    resourceName: "Resources",
    onExport: (format) =>
      format === "xlsx"
        ? projectResourcesService.exportToXlsx()
        : projectResourcesService.exportToPdf(),
  });

  return (
    <ListPageLayout
      title="Resources"
      description="People and machines for project planning"
      resourceName="Resource"
      data={table.data}
      isLoading={table.isLoading}
      error={table.error || exportError}
      querySpec={table.querySpec}
      onSearch={table.handleSearch}
      onSort={table.handleSort}
      onPageChange={table.handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => actions.setIsCreateOpen(true) : undefined}
      columns={getResourceColumns({
        onEdit: actions.setEditingItem,
        onDelete: actions.setDeletingItem,
        canEdit: canUpdate,
        canDelete: canDelete,
      })}
      searchPlaceholder="Search resources…"
      cardTitle="All Resources"
      cardDescription={
        table.data ? `${table.data.total} resources` : "Loading..."
      }
    >
      <CreateResourceDialog
        open={actions.isCreateOpen}
        onOpenChange={actions.setIsCreateOpen}
        onSuccess={actions.handleCreated}
      />
      {actions.editingItem ? (
        <EditResourceDialog
          resource={actions.editingItem}
          open={!!actions.editingItem}
          onOpenChange={(open) => !open && actions.setEditingItem(null)}
          onSuccess={actions.handleUpdated}
        />
      ) : null}
      {actions.deletingItem ? (
        <DeleteResourceDialog
          resource={actions.deletingItem}
          open={!!actions.deletingItem}
          onOpenChange={(open) => !open && actions.setDeletingItem(null)}
          onSuccess={actions.handleDeleted}
        />
      ) : null}
    </ListPageLayout>
  );
}
