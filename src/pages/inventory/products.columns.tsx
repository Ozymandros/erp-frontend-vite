import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/ui/data-table";
import { ProductDto } from "@/types/api.types";
import { formatCurrency } from "@/lib/utils";

interface ProductColumnsProps {
  readonly onEdit: (product: ProductDto) => void;
  readonly onDelete: (product: ProductDto) => void;
  readonly canEdit?: boolean;
  readonly canDelete?: boolean;
}

export function getProductColumns({ onEdit, onDelete, canEdit = true, canDelete = true }: ProductColumnsProps): Column<ProductDto>[] {
  return [
    {
      header: "SKU",
      accessor: "sku",
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      header: "Price",
      accessor: (p) => formatCurrency(p.unitPrice),
      sortable: true,
      sortField: "unitPrice",
      className: "tabular-nums",
    },
    {
      header: "Stock",
      accessor: (product) => (
        <div className="flex items-center gap-2 tabular-nums">
          {product.quantityInStock}
          {product.quantityInStock <= product.reorderLevel && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (product) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild title="View Details">
            <Link to={`/inventory/products/${product.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              title="Edit Product"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product)}
              title="Delete Product"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
