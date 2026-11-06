import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import type { ProjectDto } from "@/types/api.types";
import { formatDateTime } from "@/lib/utils";

interface ProjectColumnsProps {
  readonly onEdit: (project: ProjectDto) => void;
  readonly onDelete: (project: ProjectDto) => void;
  readonly canEdit?: boolean;
  readonly canDelete?: boolean;
}

export function getProjectColumns({
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: ProjectColumnsProps): Column<ProjectDto>[] {
  return [
    {
      header: "Number",
      accessor: (p) => (
        <Link
          to={`/projects/${p.id}`}
          className="font-medium text-primary hover:underline"
        >
          {p.projectNumber}
        </Link>
      ),
      sortable: true,
    },
    {
      header: "Description",
      accessor: (p) => p.description,
      sortable: true,
    },
    {
      header: "Status",
      accessor: (p) => <Badge variant="secondary">{p.status}</Badge>,
    },
    {
      header: "Currency",
      accessor: (p) => p.currencyCode,
    },
    {
      header: "Created",
      accessor: (p) =>
        p.createdAt ? formatDateTime(p.createdAt) : <span className="text-muted-foreground">-</span>,
      sortable: true,
    },
    {
      header: "Actions",
      accessor: (p) => (
        <div className="flex items-center gap-1">
          <Link to={`/projects/${p.id}`}>
            <Button variant="ghost" size="icon" aria-label="View project">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {canEdit ? (
            <Button variant="ghost" size="icon" onClick={() => onEdit(p)} aria-label="Edit project">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          {canDelete ? (
            <Button variant="ghost" size="icon" onClick={() => onDelete(p)} aria-label="Delete project">
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];
}
