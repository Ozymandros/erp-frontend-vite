import type React from "react";
import { useEffect, useState } from "react";
import { projectResourcesService } from "@/api/services/project-resources.service";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import {
  CreateUpdateResourceSchema,
  type CreateUpdateResourceFormData,
} from "@/lib/validation/projects/resource.schemas";
import { parseZodErrors } from "@/lib/validation";
import { ResourceType } from "@/types/api.types";
import type { ResourceGroupDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateResourceDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

const defaultForm: CreateUpdateResourceFormData = {
  resourceNo: "",
  name: "",
  type: ResourceType.Person,
  resourceGroupId: "",
  userId: "",
  baseUnitOfMeasure: "HOUR",
  unitCost: 0,
  unitPrice: 0,
  dailyCapacity: 8,
  blocked: false,
};

export function CreateResourceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateResourceDialogProps) {
  const [formData, setFormData] = useState(defaultForm);
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
      setError("Please fix validation errors");
      parseZodErrors(validation.error);
      return;
    }
    setIsLoading(true);
    try {
      await projectResourcesService.createResource({
        ...validation.data,
        resourceGroupId: validation.data.resourceGroupId || undefined,
        userId: validation.data.userId || undefined,
      });
      setFormData(defaultForm);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create resource");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create resource</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="resourceNo">Number</Label>
              <Input
                id="resourceNo"
                value={formData.resourceNo}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, resourceNo: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resourceName">Name</Label>
              <Input
                id="resourceName"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resourceGroupId">Group</Label>
              <select
                id="resourceGroupId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.resourceGroupId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, resourceGroupId: e.target.value }))
                }
              >
                <option value="">None</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.code} — {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.blocked}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, blocked: checked }))
                }
              />
              <Label>Blocked</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
