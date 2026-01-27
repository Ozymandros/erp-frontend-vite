import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import { PurchaseOrderDto } from "@/types/api.types";
import { formatDateTime, formatCurrency } from "@/lib/utils";

interface PurchaseOrderColumnsProps {
  getSupplierName: (id: string) => string;
}

export function getStatusBadge(status: string) {
  const statusMap: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    Draft: { label: "Draft", variant: "secondary" },
    Pending: { label: "Pending", variant: "outline" },
    Approved: { label: "Approved", variant: "default" },
    Ordered: { label: "Ordered", variant: "default" },
    PartiallyReceived: { label: "Partially Received", variant: "default" },
    Received: { label: "Received", variant: "default" },
    Cancelled: { label: "Cancelled", variant: "destructive" },
  };
  const statusInfo = statusMap[status] || { label: status, variant: "secondary" };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

export function getPurchaseOrderColumns({ getSupplierName }: PurchaseOrderColumnsProps): Column<PurchaseOrderDto>[] {
  return [
    {
      header: "Order Number",
      accessor: "orderNumber",
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Supplier",
      accessor: (order) => getSupplierName(order.supplierId),
    },
    {
      header: "Status",
      accessor: (order) => getStatusBadge(order.status),
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
    {
      header: "Items",
      accessor: (order) => `${order.orderLines?.length || 0} items`,
    },
    {
      header: "Total Amount",
      accessor: (order) => formatCurrency(order.totalAmount),
      sortable: true,
      sortField: "totalAmount",
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (order) => (
        <Button variant="ghost" size="sm" asChild title="View Details">
          <Link to={`/purchasing/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];
}
