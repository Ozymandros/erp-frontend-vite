import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import { OrderDto } from "@/types/api.types";
import { formatDateTime, formatCurrency } from "@/lib/utils";

interface OrderColumnsProps {
  getCustomerName: (id: string) => string;
}

export function getStatusBadge(status: string) {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    Draft: { label: "Draft", variant: "secondary" },
    Pending: { label: "Pending", variant: "outline" },
    Confirmed: { label: "Confirmed", variant: "default" },
    Fulfilled: { label: "Fulfilled", variant: "default" },
    Cancelled: { label: "Cancelled", variant: "destructive" },
  };
  const statusInfo = statusMap[status] || {
    label: status,
    variant: "secondary",
  };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

export function getOrderColumns({ getCustomerName }: OrderColumnsProps): Column<OrderDto>[] {
  return [
    {
      header: "Order Number",
      accessor: "orderNumber",
      className: "font-medium",
    },
    {
      header: "Customer",
      accessor: (order) => getCustomerName(order.customerId),
    },
    {
      header: "Status",
      accessor: (order) => getStatusBadge(order.status),
    },
    {
      header: "Date",
      accessor: (order) => <span className="tabular-nums">{formatDateTime(order.orderDate)}</span>,
    },
    {
      header: "Items",
      accessor: (order) => <span className="tabular-nums">{`${order.orderLines?.length || 0} items`}</span>,
    },
    {
      header: "Total Amount",
      accessor: (order) => <span className="tabular-nums">{formatCurrency(order.totalAmount)}</span>,
      className: "text-right",
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (order) => (
        <Button variant="ghost" size="sm" asChild title="View Details">
          <Link to={`/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];
}
