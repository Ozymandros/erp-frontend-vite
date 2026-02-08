import { Link } from "react-router-dom";
import { Eye, Package, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import { InventoryTransactionDto, TransactionType } from "@/types/api.types";
import { formatDateTime } from "@/lib/utils";

interface InventoryTransactionColumnsProps {
  readonly getProductName: (id: string) => string;
  readonly getWarehouseName: (id: string) => string;
  readonly getTypeBadgeVariant: (type: TransactionType) => "default" | "destructive" | "secondary" | "outline";
  readonly getTransactionTypeLabel: (type: TransactionType) => string;
}

export function getInventoryTransactionColumns({
  getProductName,
  getWarehouseName,
  getTypeBadgeVariant,
  getTransactionTypeLabel,
}: InventoryTransactionColumnsProps): Column<InventoryTransactionDto>[] {
  return [
    {
      header: "Date",
      accessor: (tx) => formatDateTime(tx.transactionDate),
      sortable: true,
      sortField: "transactionDate",
    },
    {
      header: "Type",
      accessor: (tx) => (
        <Badge variant={getTypeBadgeVariant(tx.transactionType)}>
          {getTransactionTypeLabel(tx.transactionType)}
        </Badge>
      ),
      sortable: true,
      sortField: "transactionType",
    },
    {
      header: (
        <>
          <Package className="h-4 w-4 inline mr-2" />
          Product
        </>
      ),
      accessor: (tx) => getProductName(tx.productId),
    },
    {
      header: (
        <>
          <Warehouse className="h-4 w-4 inline mr-2" />
          Warehouse
        </>
      ),
      accessor: (tx) => getWarehouseName(tx.warehouseId),
    },
    {
      header: "Quantity",
      accessor: (tx) => {
        const isPositive = tx.quantity > 0;
        const isNegative = tx.quantity < 0;
        const colorClass = isPositive 
          ? "text-green-600 font-semibold" 
          : isNegative 
          ? "text-red-600 font-semibold" 
          : "";
        
        return (
          <span className={colorClass}>
            {isPositive ? "+" : ""}
            {tx.quantity}
          </span>
        );
      },
      sortable: true,
      sortField: "quantity",
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (tx) => (
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/inventory/transactions/${tx.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];
}
