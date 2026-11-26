import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Column } from "@/components/ui/data-table";
import type { EntityChangeDto } from "@/types/api.types";
import { formatDateTime } from "@/lib/utils";

export type ChangeTypeBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export function truncateEntityId(entityId: string): string {
  if (entityId.length <= 12) {
    return entityId;
  }
  return `${entityId.slice(0, 8)}…`;
}

export function getChangeTypeBadgeVariant(
  changeType: string,
): ChangeTypeBadgeVariant {
  const t = changeType.toLowerCase();
  if (t.includes("creat") || t.includes("add")) {
    return "default";
  }
  if (t.includes("delet") || t.includes("remov")) {
    return "destructive";
  }
  if (t.includes("updat") || t.includes("modif")) {
    return "secondary";
  }
  return "outline";
}

export function getEntityChangeColumns(): Column<EntityChangeDto>[] {
  return [
    {
      header: "Entity",
      accessor: (row) => (
        <Badge variant="outline" className="font-normal">
          {row.entityName}
        </Badge>
      ),
      sortable: true,
      sortField: "entityName",
    },
    {
      header: "Entity ID",
      accessor: (row) => (
        <span
          className="font-mono text-sm text-muted-foreground"
          title={row.entityId}
        >
          {truncateEntityId(row.entityId)}
        </span>
      ),
    },
    {
      header: "Change type",
      accessor: (row) => (
        <Badge variant={getChangeTypeBadgeVariant(row.changeType)}>
          {row.changeType}
        </Badge>
      ),
      sortable: true,
      sortField: "changeType",
    },
    {
      header: "When",
      accessor: (row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDateTime(row.createdAt)}
        </span>
      ),
      sortable: true,
      sortField: "createdAt",
    },
    {
      header: "Changed by",
      accessor: (row) => row.createdBy,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" asChild title="View details">
            <Link to={`/audit/entity-changes/${row.id}`}>View</Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="View details">
            <Link to={`/audit/entity-changes/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];
}
