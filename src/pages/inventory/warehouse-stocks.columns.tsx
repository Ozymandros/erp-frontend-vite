import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import { WarehouseStockDto } from "@/types/api.types";
import { AlertTriangle, Package, Warehouse } from "lucide-react";

interface WarehouseStockColumnsProps {
  getProductName: (id: string) => string;
  getWarehouseName: (id: string) => string;
}

export function getWarehouseStockColumns({
  getProductName,
  getWarehouseName,
}: WarehouseStockColumnsProps): Column<WarehouseStockDto>[] {
  const availableQuantity = (stock: WarehouseStockDto) => stock.quantity - stock.reservedQuantity;
  const isLowStock = (stock: WarehouseStockDto) => availableQuantity(stock) <= stock.reorderLevel;

  return [
    {
      header: (
        <>
          <Package className="h-4 w-4 inline mr-2" />
          Product
        </>
      ),
      accessor: (stock) => getProductName(stock.productId),
      className: "font-medium",
    },
    {
      header: (
        <>
          <Warehouse className="h-4 w-4 inline mr-2" />
          Warehouse
        </>
      ),
      accessor: (stock) => getWarehouseName(stock.warehouseId),
    },
    {
      header: "Total Qty",
      accessor: "quantity",
    },
    {
      header: "Reserved",
      accessor: (stock) => <span className="text-orange-600">{stock.reservedQuantity}</span>,
    },
    {
      header: "Available",
      accessor: (stock) => {
        const available = availableQuantity(stock);
        const low = isLowStock(stock);
        return (
          <span className={low ? "text-red-600 font-semibold" : available > 0 ? "text-green-600" : ""}>
            {available}
          </span>
        );
      },
    },
    {
      header: "Reorder",
      accessor: "reorderLevel",
    },
    {
      header: "Status",
      accessor: (stock) => {
        const available = availableQuantity(stock);
        const low = isLowStock(stock);
        if (low) {
          return (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low Stock
            </Badge>
          );
        }
        return available > 0 ? <Badge variant="default">In Stock</Badge> : <Badge variant="secondary">Out of Stock</Badge>;
      },
    },
  ];
}
