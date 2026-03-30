import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Column } from "@/components/ui/data-table";
import type { ActivityDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";

export function getActivityColumns(): Column<ActivityDto>[] {
  return [
    {
      header: "Subject",
      accessor: "subject",
      sortable: true,
    },
    {
      header: "Type",
      accessor: "type",
      sortable: true,
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
    },
    {
      header: "Due",
      accessor: (a) =>
        a.dueAt ? new Date(a.dueAt).toLocaleDateString() : <span className="text-muted-foreground">-</span>,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (a) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild title="View Activity">
            <Link to={`/crm/activities/${a.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];
}

