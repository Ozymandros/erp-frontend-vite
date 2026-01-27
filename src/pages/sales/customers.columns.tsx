import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/ui/data-table";
import { CustomerDto } from "@/types/api.types";

export function getCustomerColumns(): Column<CustomerDto>[] {
  return [
    {
      header: "Name",
      accessor: "name",
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Email",
      accessor: (customer) => customer.email || <span className="text-muted-foreground">-</span>,
      sortable: true,
    },
    {
      header: "Phone",
      accessor: (customer) => customer.phoneNumber || <span className="text-muted-foreground">-</span>,
    },
    {
      header: "Address",
      accessor: (customer) => customer.address || <span className="text-muted-foreground">-</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (customer) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild title="View Details">
            <Link to={`/sales/customers/${customer.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];
}
