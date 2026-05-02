import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Column } from "@/components/ui/data-table";
import type { AccountDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";

export function getAccountColumns(): Column<AccountDto>[] {
  return [
    {
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      header: "Customer ID",
      accessor: "customerId",
      sortable: true,
    },
    {
      header: "Owner",
      accessor: "ownerUsername",
    },
    {
      header: "Active",
      accessor: (a) => (a.isActive ? "Yes" : "No"),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (a) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild title="View Account">
            <Link to={`/crm/accounts/${a.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];
}

