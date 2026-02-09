import { Column } from "@/components/ui/data-table";
import { PurchaseOrderDto } from "@/types/api.types";
import { formatDateTime } from "@/lib/utils";
import {
  getStatusBadge,
  getOrderNumberColumn,
  getItemsCountColumn,
  getTotalAmountColumn,
  getActionsColumn,
} from "@/lib/order-columns.utils";

interface PurchaseOrderColumnsProps {
  readonly getSupplierName: (id: string) => string;
}

const purchaseStatusMap = {
  Draft: { label: "Draft", variant: "secondary" as const },
  Pending: { label: "Pending", variant: "outline" as const },
  Approved: { label: "Approved", variant: "default" as const },
  Ordered: { label: "Ordered", variant: "default" as const },
  PartiallyReceived: { label: "Partially Received", variant: "default" as const },
  Received: { label: "Received", variant: "default" as const },
  Cancelled: { label: "Cancelled", variant: "destructive" as const },
};

export function getPurchaseOrderStatusBadge(status: string) {
  return getStatusBadge(status, purchaseStatusMap);
}

export function getPurchaseOrderColumns({ getSupplierName }: PurchaseOrderColumnsProps): Column<PurchaseOrderDto>[] {
  return [
    getOrderNumberColumn<PurchaseOrderDto>(),
    {
      header: "Supplier",
      accessor: (order) => getSupplierName(order.supplierId),
    },
    {
      header: "Status",
      accessor: (order) => getPurchaseOrderStatusBadge(order.status),
      sortable: true,
    },
    {
      header: "Order Date",
      accessor: (order) => formatDateTime(order.orderDate),
      sortable: true,
      sortField: "orderDate",
    },
    {
      header: "Expected Delivery",
      accessor: (order) => (order.expectedDeliveryDate ? formatDateTime(order.expectedDeliveryDate) : "-"),
    },
    getItemsCountColumn<PurchaseOrderDto>(),
    getTotalAmountColumn<PurchaseOrderDto>(),
    getActionsColumn<PurchaseOrderDto>("/purchasing/orders"),
  ];
}
