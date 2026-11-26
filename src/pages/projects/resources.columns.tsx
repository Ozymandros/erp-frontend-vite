import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/ui/data-table";
import type { ResourceDto } from "@/types/api.types";

interface ResourceColumnsProps {
  readonly onEdit: (resource: ResourceDto) => void;
  readonly onDelete: (resource: ResourceDto) => void;
  readonly canEdit?: boolean;
  readonly canDelete?: boolean;
}

export function getResourceColumns({
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: ResourceColumnsProps): Column<ResourceDto>[] {
  return [
    {
      header: "Number",
      accessor: (r) => (
        <Link to={`/projects/resources/${r.id}`} className="text-primary hover:underline">
          {r.resourceNo}
        </Link>
      ),
      sortable: true,
    },
    { header: "Name", accessor: (r) => r.name, sortable: true },
    { header: "Type", accessor: (r) => r.type },
    { header: "Group", accessor: (r) => r.resourceGroupCode ?? "—" },
    {
      header: "Actions",
      accessor: (r) => (
        <div className="flex gap-1">
          <Link to={`/projects/resources/${r.id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {canEdit ? (
            <Button variant="ghost" size="icon" onClick={() => onEdit(r)}>
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          {canDelete ? (
            <Button variant="ghost" size="icon" onClick={() => onDelete(r)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];
}
