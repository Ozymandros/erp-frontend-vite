import { projectsService } from "@/api/services/projects.service";
import type { ProjectDto, QuerySpec } from "@/types/api.types";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { useDataTable } from "@/hooks/use-data-table";
import { useListActions } from "@/hooks/use-list-actions";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useExport } from "@/hooks/use-export";
import { ListPageLayout } from "@/components/layout/list-page-layout";
import { getProjectColumns } from "./projects.columns";

export function ProjectsListPage() {
  const fetcher = (qs: QuerySpec) =>
    projectsService.searchProjects({
      page: qs.page || 1,
      pageSize: qs.pageSize || 10,
      searchTerm: qs.searchTerm,
      searchFields: qs.searchFields ?? "description,projectNumber,status",
      sortBy: qs.sortBy ?? "createdAt",
      sortDesc: qs.sortDesc ?? true,
      filters: qs.filters,
    });

  const {
    data: projects,
    isLoading,
    error: dataError,
    querySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    refresh,
  } = useDataTable<ProjectDto>({
    fetcher,
    resourceName: "projects",
  });

  const { canCreate, canUpdate, canDelete, canExport } =
    useModulePermissions("projects");

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
  } = useListActions<ProjectDto>({ refresh });

  const { handleExport, exportError } = useExport({
    resourceName: "Projects",
    onExport: (format) =>
      format === "xlsx"
        ? projectsService.exportToXlsx()
        : projectsService.exportToPdf(),
  });

  const columns = getProjectColumns({
    onEdit: setEditingItem,
    onDelete: setDeletingItem,
    canEdit: canUpdate,
    canDelete: canDelete,
  });

  return (
    <ListPageLayout
      title="Projects"
      description="Manage projects, tasks, and planning"
      resourceName="Project"
      data={projects}
      isLoading={isLoading}
      error={dataError || exportError}
      querySpec={querySpec}
      onSearch={handleSearch}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onExport={canExport ? handleExport : undefined}
      onCreateOpen={canCreate ? () => setIsCreateOpen(true) : undefined}
      columns={columns}
      searchPlaceholder="Search projects…"
      cardTitle="All Projects"
      cardDescription={
        projects ? `${projects.total} total projects` : "Loading..."
      }
    >
      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreated}
      />
      {editingItem ? (
        <EditProjectDialog
          project={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={handleUpdated}
        />
      ) : null}
      {deletingItem ? (
        <DeleteProjectDialog
          project={deletingItem}
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onSuccess={handleDeleted}
        />
      ) : null}
    </ListPageLayout>
  );
}
