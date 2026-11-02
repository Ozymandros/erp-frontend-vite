import { Column } from "@/components/ui/data-table";
import { SalesOrderDto } from "@/types/api.types";
import {
  getStatusBadge,
  getOrderNumberColumn,
  getOrderDateColumn,
  getItemsCountColumn,
  getTotalAmountColumn,
  getActionsColumn,
  SALES_ORDER_STATUS_MAP,
} from "@/lib/order-columns.utils";

interface SalesOrderColumnsProps {
  readonly getCustomerName: (id: string) => string;
}

export function getSalesOrderStatusBadge(status: string) {
  return getStatusBadge(status, SALES_ORDER_STATUS_MAP);
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
