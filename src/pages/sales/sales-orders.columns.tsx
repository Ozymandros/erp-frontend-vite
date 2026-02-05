import { Column } from "@/components/ui/data-table";
import { SalesOrderDto } from "@/types/api.types";
import {
  getStatusBadge,
  getOrderNumberColumn,
  getOrderDateColumn,
  getItemsCountColumn,
  getTotalAmountColumn,
  getActionsColumn,
} from "@/lib/order-columns.utils";

interface SalesOrderColumnsProps {
  getCustomerName: (id: string) => string;
}

const salesStatusMap = {
  Draft: { label: "Draft", variant: "secondary" as const },
  Quote: { label: "Quote", variant: "outline" as const },
  Confirmed: { label: "Confirmed", variant: "default" as const },
  Processing: { label: "Processing", variant: "default" as const },
  Shipped: { label: "Shipped", variant: "default" as const },
  Delivered: { label: "Delivered", variant: "default" as const },
  Cancelled: { label: "Cancelled", variant: "destructive" as const },
};

export function getSalesOrderStatusBadge(status: string) {
  return getStatusBadge(status, salesStatusMap);
}

export function getSalesOrderColumns({ getCustomerName }: SalesOrderColumnsProps): Column<SalesOrderDto>[] {
  return [
    getOrderNumberColumn<SalesOrderDto>(),
    {
      header: "Customer",
      accessor: (order) => getCustomerName(order.customerId),
    },
    {
      header: "Status",
      accessor: (order) => getSalesOrderStatusBadge(order.status),
      sortable: true,
    },
    getOrderDateColumn<SalesOrderDto>(),
    getItemsCountColumn<SalesOrderDto>(),
    getTotalAmountColumn<SalesOrderDto>(),
    getActionsColumn<SalesOrderDto>("/sales/orders"),
  ];
}
