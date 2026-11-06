import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import type { ResourceGroupDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditResourceGroupDialog } from "@/components/projects/edit-resource-group-dialog";
import { DeleteResourceGroupDialog } from "@/components/projects/delete-resource-group-dialog";
import { useModulePermissions } from "@/hooks/use-permissions";

export function ResourceGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<ResourceGroupDto | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { canUpdate, canDelete } = useModulePermissions("projects");

  const refresh = useCallback(async () => {
    if (!id) return;
    setGroup(await projectResourceGroupsService.getResourceGroupById(id));
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!group) {
    return <p className="p-6 text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/projects/resource-groups">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>
      <div className="flex gap-2">
        {canUpdate ? <Button onClick={() => setIsEditOpen(true)}>Edit</Button> : null}
        {canDelete ? (
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            Delete
          </Button>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{group.code}</CardTitle>
        </CardHeader>
        <CardContent>{group.name}</CardContent>
      </Card>
      <EditResourceGroupDialog
        group={group}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={refresh}
      />
      <DeleteResourceGroupDialog
        group={group}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={() => navigate("/projects/resource-groups")}
      />
    </div>
  );
}
