import React from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import { User } from "@/types/api.types";
import { formatDateTime } from "@/lib/utils";

interface UserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function getUserColumns({ onEdit, onDelete }: UserColumnsProps): Column<User>[] {
  return [
    {
      header: "Username",
      accessor: "username",
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Email",
      accessor: "email",
      sortable: true,
    },
    {
      header: "Name",
      accessor: (user) => (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "-"),
    },
    {
      header: "Roles",
      accessor: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <Badge key={role.id} variant="secondary" className="text-xs">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No roles</span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (user) => (
        <Badge variant={user.isActive ? "default" : "destructive"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessor: (user) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(user.createdAt)}</span>
      ),
      sortable: true,
      sortField: "createdAt",
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (user) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/users/${user.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(user)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}
