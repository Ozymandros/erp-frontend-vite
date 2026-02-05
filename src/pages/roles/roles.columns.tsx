import { Link } from "react-router-dom"
import { Eye, Pencil, Trash2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Column } from "@/components/ui/data-table"
import { Role } from "@/types/api.types"
import { formatDateTime } from "@/lib/utils"

interface RoleColumnsProps {
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canManagePermissions?: boolean;
}

export function getRoleColumns({ onEdit, onDelete, canEdit = true, canDelete = true, canManagePermissions = true }: RoleColumnsProps): Column<Role>[] {
  return [
    {
      header: "Name",
      accessor: (role) => (
        <Link
          to={`/roles/${role.id}`}
          className="font-medium text-primary hover:underline"
        >
          {role.name}
        </Link>
      ),
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Description",
      accessor: (role) => <div className="max-w-md truncate">{role.description || "-"}</div>,
      sortable: false,
    },
    {
      header: "Permissions",
      accessor: (role) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{role.permissions?.length || 0}</Badge>
          <span className="text-sm text-muted-foreground">permissions</span>
        </div>
      ),
    },
    {
      header: "Created",
      accessor: (role) => <span className="text-sm text-muted-foreground">{formatDateTime(role.createdAt)}</span>,
      sortable: true,
      sortField: "createdAt",
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (role) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild title="View Details">
            <Link to={`/roles/${role.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {canManagePermissions && (
            <Button variant="ghost" size="icon" asChild title="Manage Permissions">
              <Link to={`/roles/${role.id}#permissions`}>
                <Shield className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {canEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(role)} title="Edit Role">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(role)} title="Delete Role">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ]
}
