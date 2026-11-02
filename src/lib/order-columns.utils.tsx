import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table";
import { formatDateTime, formatCurrency } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface StatusConfig {
  readonly label: string;
  readonly variant: BadgeVariant;
}

export const SALES_ORDER_STATUS_MAP: Record<string, StatusConfig> = {
  Draft: { label: "Draft", variant: "secondary" },
  Quote: { label: "Quote", variant: "outline" },
  Confirmed: { label: "Confirmed", variant: "default" },
  Invoiced: { label: "Invoiced", variant: "default" },
  Processing: { label: "Processing", variant: "default" },
  Shipped: { label: "Shipped", variant: "default" },
  Delivered: { label: "Delivered", variant: "default" },
  Cancelled: { label: "Cancelled", variant: "destructive" },
};

export const PURCHASE_ORDER_MATCH_STATUS_MAP: Record<string, StatusConfig> = {
  Unmatched: { label: "Unmatched", variant: "secondary" },
  Partial: { label: "Partial", variant: "outline" },
  Matched: { label: "Matched", variant: "default" },
  Overbilled: { label: "Overbilled", variant: "destructive" },
};

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

export function getItemsCountColumn<T extends { lines?: readonly unknown[] }>(): Column<T> {
  return {
    header: "Items",
    accessor: (order) => `${order.lines?.length || 0} items`,
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
