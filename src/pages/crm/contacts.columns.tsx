import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Column } from "@/components/ui/data-table";
import type { ContactDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";

export function getContactColumns(): Column<ContactDto>[] {
  return [
    {
      header: "Full Name",
      accessor: "fullName",
      sortable: true,
    },
    {
      header: "Account",
      accessor: "accountId",
      sortable: true,
    },
    {
      header: "Primary",
      accessor: (c) => (c.isPrimary ? "Yes" : "No"),
      sortable: false,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild title="View Contact">
            <Link to={`/crm/contacts/${c.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];
}

