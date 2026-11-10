import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { projectResourcesService } from "@/api/services/project-resources.service";
import type { ResourceDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditResourceDialog } from "@/components/projects/edit-resource-dialog";
import { DeleteResourceDialog } from "@/components/projects/delete-resource-dialog";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useNavigate } from "react-router-dom";

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<ResourceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { canUpdate, canDelete } = useModulePermissions("projects");

  const refresh = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      setResource(await projectResourcesService.getResourceById(id));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load resource");
      setResource(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (isLoading) {
    return <p className="text-muted-foreground p-6">Loading…</p>;
  }

  if (error || !resource) {
    return <p className="text-destructive p-6">{error ?? "Not found"}</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/projects/resources">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to resources
        </Button>
      </Link>
      <div className="flex gap-2">
        {canUpdate ? (
          <Button onClick={() => setIsEditOpen(true)}>Edit</Button>
        ) : null}
        {canDelete ? (
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            Delete
          </Button>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {resource.resourceNo} — {resource.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p>Type: {resource.type}</p>
          <p>Group: {resource.resourceGroupCode ?? "—"}</p>
          <p>UoM: {resource.baseUnitOfMeasure}</p>
          <p>
            Cost / Price: {resource.unitCost} / {resource.unitPrice}
          </p>
          <p>Blocked: {resource.blocked ? "Yes" : "No"}</p>
        </CardContent>
      </Card>
      <EditResourceDialog
        resource={resource}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={refresh}
      />
      <DeleteResourceDialog
        resource={resource}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={() => navigate("/projects/resources")}
      />
    </div>
  );
}
