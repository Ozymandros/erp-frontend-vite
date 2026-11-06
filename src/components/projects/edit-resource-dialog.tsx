import type React from "react";
import { useEffect, useState } from "react";
import { projectResourcesService } from "@/api/services/project-resources.service";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import {
  CreateUpdateResourceSchema,
  type CreateUpdateResourceFormData,
} from "@/lib/validation/projects/resource.schemas";
import { ResourceType, type ResourceDto, type ResourceGroupDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

function typeFromLabel(label: string): ResourceType {
  return label.toLowerCase().includes("machine")
    ? ResourceType.Machine
    : ResourceType.Person;
}

interface EditResourceDialogProps {
  readonly resource: ResourceDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function EditResourceDialog({
  resource,
  open,
  onOpenChange,
  onSuccess,
}: EditResourceDialogProps) {
  const [formData, setFormData] = useState<CreateUpdateResourceFormData>({
    resourceNo: resource.resourceNo,
    name: resource.name,
    type: typeFromLabel(resource.type),
    resourceGroupId: resource.resourceGroupId ?? "",
    userId: resource.userId ?? "",
    baseUnitOfMeasure: resource.baseUnitOfMeasure,
    unitCost: resource.unitCost,
    unitPrice: resource.unitPrice,
    dailyCapacity: resource.dailyCapacity,
    blocked: resource.blocked,
  });
  const [groups, setGroups] = useState<ResourceGroupDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      void projectResourceGroupsService.getResourceGroups().then(setGroups);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateUpdateResourceSchema.safeParse(formData);
    if (!validation.success) {
      setError("Invalid form");
      return;
    }
    setIsLoading(true);
    try {
      await projectResourcesService.updateResource(resource.id, {
        ...validation.data,
        resourceGroupId: validation.data.resourceGroupId || undefined,
        userId: validation.data.userId || undefined,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit resource</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-3 py-4">
            <Input
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.resourceGroupId}
              onChange={(e) =>
                setFormData((p) => ({ ...p, resourceGroupId: e.target.value }))
              }
            >
              <option value="">No group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
