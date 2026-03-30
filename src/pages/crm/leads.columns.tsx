import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { LeadDto } from "@/types/api.types";

export function getLeadColumns(): Column<LeadDto>[] {
  return [
    {
      header: "Title",
      accessor: "title",
      sortable: true,
      className: "font-medium",
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
    },
    {
      header: "Owner",
      accessor: "ownerUsername",
      sortable: true,
    },
    {
      header: "Contact",
      accessor: (lead) =>
        lead.contactName ? `${lead.contactName}` : <span className="text-muted-foreground">-</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (lead) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild title="View Lead">
            <Link to={`/crm/leads/${lead.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];
}

