import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import { formatDateTime, formatCurrency } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusConfig {
  readonly label: string;
  readonly variant: BadgeVariant;
}

/**
 * Generic status badge renderer
 */
export function getStatusBadge(status: string, statusMap: Record<string, StatusConfig>) {
  const statusInfo = statusMap[status] || { label: status, variant: "secondary" as const };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

/**
 * Common order column definitions
 */
export function getOrderNumberColumn<T extends { orderNumber: string }>(): Column<T> {
  return {
    header: "Order Number",
    accessor: "orderNumber",
    sortable: true,
    className: "font-medium",
  };
}

export function getOrderDateColumn<T extends { orderDate: string }>(): Column<T> {
  return {
    header: "Date",
    accessor: (order) => formatDateTime(order.orderDate),
    sortable: true,
    sortField: "orderDate",
  };
}

export function getItemsCountColumn<T extends { orderLines?: readonly unknown[] }>(): Column<T> {
  return {
    header: "Items",
    accessor: (order) => `${order.orderLines?.length || 0} items`,
  };
}

export function getTotalAmountColumn<T extends { totalAmount: number }>(): Column<T> {
  return {
    header: "Total Amount",
    accessor: (order) => formatCurrency(order.totalAmount),
    sortable: true,
    sortField: "totalAmount",
  };
}

export function getActionsColumn<T extends { id: string }>(basePath: string): Column<T> {
  return {
    header: "Actions",
    className: "text-right",
    accessor: (order) => (
      <Button variant="ghost" size="sm" asChild title="View Details">
        <Link to={`${basePath}/${order.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  };
}
