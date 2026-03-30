import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { OpportunityDto } from "@/types/api.types";

export function getOpportunityColumns(): Column<OpportunityDto>[] {
  return [
    {
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      header: "Stage",
      accessor: "stage",
      sortable: true,
    },
    {
      header: "Owner",
      accessor: "ownerUsername",
      sortable: true,
    },
    {
      header: "Expected Close",
      accessor: (o) =>
        o.expectedCloseDate ? o.expectedCloseDate : <span className="text-muted-foreground">-</span>,
      sortable: false,
    },
    {
      header: "Expected Amount",
      accessor: (o) =>
        typeof o.expectedAmount === "number" ? o.expectedAmount : <span className="text-muted-foreground">-</span>,
      sortable: false,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (o) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild title="View Opportunity">
            <Link to={`/crm/opportunities/${o.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];
}

