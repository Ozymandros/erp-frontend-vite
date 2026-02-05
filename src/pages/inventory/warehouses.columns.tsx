import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/ui/data-table";
import { WarehouseDto } from "@/types/api.types";

interface WarehouseColumnsProps {
  onEdit: (warehouse: WarehouseDto) => void;
  onDelete: (warehouse: WarehouseDto) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function getWarehouseColumns({ onEdit, onDelete, canEdit = true, canDelete = true }: WarehouseColumnsProps): Column<WarehouseDto>[] {
  return [
    {
      header: "Name",
      accessor: "name",
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Location",
      accessor: (warehouse) => warehouse.location || <span className="text-muted-foreground">-</span>,
      sortable: true,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (warehouse) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild title="View Details">
            <Link to={`/inventory/warehouses/${warehouse.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(warehouse)}
              title="Edit Warehouse"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(warehouse)}
              title="Delete Warehouse"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
