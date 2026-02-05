import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Column } from "@/components/ui/data-table"
import { Permission } from "@/types/api.types"
import { formatDateTime } from "@/lib/utils"

interface PermissionColumnsProps {
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function getPermissionColumns({ onEdit, onDelete, canEdit = true, canDelete = true }: PermissionColumnsProps): Column<Permission>[] {
  return [
    {
      header: "Module",
      accessor: (permission) => <Badge variant="secondary">{permission.module}</Badge>,
      sortable: true,
      sortField: "module",
    },
    {
      header: "Action",
      accessor: (permission) => <Badge variant="outline">{permission.action}</Badge>,
      sortable: true,
      sortField: "action",
    },
    {
      header: "Description",
      accessor: (permission) => <div className="max-w-md">{permission.description || "-"}</div>,
    },
    {
      header: "Created",
      accessor: (permission) => <span className="text-sm text-muted-foreground">{formatDateTime(permission.createdAt)}</span>,
      sortable: true,
      sortField: "createdAt",
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (permission) => (
        <div className="flex items-center justify-end gap-2">
          {canEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(permission)} title="Edit Permission">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(permission)} title="Delete Permission">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ]
}
