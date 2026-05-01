import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvoiceStatus } from "@/types/api.types";

interface InvoiceFilterHeaderProps {
  readonly status?: string;
  readonly onStatusChange: (status?: InvoiceStatus) => void;
}

const INVOICE_STATUS_OPTIONS: InvoiceStatus[] = [
  "Draft",
  "Issued",
  "Sent",
  "Paid",
  "Cancelled",
  "WrittenOff",
];

export function InvoiceFilterHeader({
  status,
  onStatusChange,
}: InvoiceFilterHeaderProps) {
  return (
    <Select
      value={status || "all"}
      onValueChange={(value) =>
        onStatusChange(value === "all" ? undefined : (value as InvoiceStatus))
      }
    >
      <SelectTrigger className="w-[200px]" aria-label="Filter by invoice status">
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        {INVOICE_STATUS_OPTIONS.map((invoiceStatus) => (
          <SelectItem key={invoiceStatus} value={invoiceStatus}>
            {invoiceStatus}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
