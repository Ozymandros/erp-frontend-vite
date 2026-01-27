import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import { SalesOrderDto } from "@/types/api.types";
import { formatDateTime, formatCurrency } from "@/lib/utils";

interface SalesOrderColumnsProps {
  getCustomerName: (id: string) => string;
}

export function getStatusBadge(status: string) {
  const statusMap: Record<
    string,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
  > = {
    Draft: { label: "Draft", variant: "secondary" },
    Quote: { label: "Quote", variant: "outline" },
    Confirmed: { label: "Confirmed", variant: "default" },
    Processing: { label: "Processing", variant: "default" },
    Shipped: { label: "Shipped", variant: "default" },
    Delivered: { label: "Delivered", variant: "default" },
    Cancelled: { label: "Cancelled", variant: "destructive" },
  };
  const statusInfo = statusMap[status] || { label: status, variant: "secondary" };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

export function getSalesOrderColumns({ getCustomerName }: SalesOrderColumnsProps): Column<SalesOrderDto>[] {
  return [
    {
      header: "Order Number",
      accessor: "orderNumber",
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Customer",
      accessor: (order) => getCustomerName(order.customerId),
    },
    {
      header: "Status",
      accessor: (order) => getStatusBadge(order.status),
      sortable: true,
    },
    {
      header: "Date",
      accessor: (order) => formatDateTime(order.orderDate),
      sortable: true,
      sortField: "orderDate",
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
          <Link to={`/sales/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];
}
