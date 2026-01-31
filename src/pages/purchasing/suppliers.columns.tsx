import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import type { SupplierDto } from "@/types/api.types";
import { formatDateTime } from "@/lib/utils";

interface SupplierColumnsProps {
  onEdit: (supplier: SupplierDto) => void;
  onDelete: (supplier: SupplierDto) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function getSupplierColumns({
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: SupplierColumnsProps): Column<SupplierDto>[] {
  return [
    {
      header: "Name",
      accessor: (supplier) => (
        <Link
          to={`/purchasing/suppliers/${supplier.id}`}
          className="font-medium text-primary hover:underline"
        >
          {supplier.name}
        </Link>
      ),
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Email",
      accessor: (supplier) => supplier.email || <span className="text-muted-foreground">-</span>,
      sortable: true,
    },
    {
      header: "Phone",
      accessor: (supplier) => supplier.phone || <span className="text-muted-foreground">-</span>,
    },
    {
      header: "Address",
      accessor: (supplier) => (
        <div className="max-w-xs truncate">
          {supplier.address || supplier.city
            ? [supplier.address, supplier.city, supplier.country].filter(Boolean).join(", ") || "-"
            : "-"}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (supplier) => (
        <Badge variant={supplier.isActive ? "default" : "secondary"}>
          {supplier.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessor: (supplier) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(supplier.createdAt)}</span>
      ),
      sortable: true,
      sortField: "createdAt",
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (supplier) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild title="View Details">
            <Link to={`/purchasing/suppliers/${supplier.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(supplier)}
              title="Edit Supplier"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(supplier)}
              title="Delete Supplier"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
