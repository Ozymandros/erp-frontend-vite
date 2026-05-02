import { Column } from "@/components/ui/data-table";
import type { InvoiceDto } from "@/types/api.types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getActionsColumn, getStatusBadge } from "@/lib/order-columns.utils";

const invoiceStatusMap = {
  Draft: { label: "Draft", variant: "secondary" as const },
  Issued: { label: "Issued", variant: "default" as const },
  Sent: { label: "Sent", variant: "outline" as const },
  Paid: { label: "Paid", variant: "default" as const },
  Cancelled: { label: "Cancelled", variant: "destructive" as const },
  WrittenOff: { label: "Written Off", variant: "destructive" as const },
};

export function getInvoiceColumns(): Column<InvoiceDto>[] {
  return [
    {
      header: "Invoice Number",
      accessor: "invoiceNumber",
      sortable: true,
      className: "font-medium",
      sortField: "invoiceNumber",
    },
    {
      header: "Status",
      accessor: (invoice) => getStatusBadge(invoice.status, invoiceStatusMap),
      sortable: true,
      sortField: "status",
    },
    {
      header: "Issue Date",
      accessor: (invoice) => formatDateTime(invoice.issueDate),
      sortable: true,
      sortField: "issueDate",
    },
    {
      header: "Due Date",
      accessor: (invoice) => formatDateTime(invoice.dueDate),
      sortable: true,
      sortField: "dueDate",
    },
    {
      header: "Gross",
      accessor: (invoice) => formatCurrency(invoice.totalGross),
      sortable: true,
      sortField: "totalGross",
    },
    {
      header: "Outstanding",
      accessor: (invoice) => formatCurrency(invoice.outstandingAmount),
      sortable: true,
      sortField: "outstandingAmount",
    },
    getActionsColumn<InvoiceDto>("/billing/invoices"),
  ];
}
