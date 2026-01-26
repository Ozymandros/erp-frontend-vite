import React from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Column } from "@/components/ui/data-table"
import { Permission } from "@/types/api.types"
import { formatDateTime } from "@/lib/utils"

interface PermissionColumnsProps {
  onEdit: (permission: Permission) => void
  onDelete: (permission: Permission) => void
}

export function getPermissionColumns({ onEdit, onDelete }: PermissionColumnsProps): Column<Permission>[] {
  return [
    {
      header: "Module",
      accessor: (permission) => <Badge variant="secondary">{permission.module}</Badge>,
    },
    {
      header: "Action",
      accessor: (permission) => <Badge variant="outline">{permission.action}</Badge>,
    },
    {
      header: "Description",
      accessor: (permission) => <div className="max-w-md">{permission.description || "-"}</div>,
    },
    {
      header: "Created",
      accessor: (permission) => <span className="text-sm text-muted-foreground">{formatDateTime(permission.createdAt)}</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (permission) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(permission)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(permission)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]
}
