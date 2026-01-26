import React from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/ui/data-table";
import { ProductDto } from "@/types/api.types";
import { formatCurrency } from "@/lib/utils";

interface ProductColumnsProps {
  onEdit: (product: ProductDto) => void;
  onDelete: (product: ProductDto) => void;
}

export function getProductColumns({ onEdit, onDelete }: ProductColumnsProps): Column<ProductDto>[] {
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
    },
    {
      header: "Stock",
      accessor: (product) => (
        <div className="flex items-center gap-2">
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
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/inventory/products/${product.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];
}
