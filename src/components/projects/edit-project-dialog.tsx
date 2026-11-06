import type React from "react";
import { useEffect, useState } from "react";
import { projectsService } from "@/api/services/projects.service";
import { customersService } from "@/api/services/customers.service";
import {
  UpdateProjectSchema,
  type UpdateProjectFormData,
} from "@/lib/validation/projects/project.schemas";
import { parseZodErrors } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ProjectBlocked,
  type CustomerDto,
  type ProjectDto,
} from "@/types/api.types";

interface EditProjectDialogProps {
  readonly project: ProjectDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

function blockedFromLabel(label: string): ProjectBlocked {
  const normalized = label.toLowerCase();
  if (normalized.includes("posting")) return ProjectBlocked.Posting;
  if (normalized.includes("all")) return ProjectBlocked.All;
  return ProjectBlocked.None;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState<UpdateProjectFormData>({
    description: project.description,
    customerId: project.customerId,
    projectManagerUserId: project.projectManagerUserId ?? "",
    startingDate: project.startingDate?.slice(0, 10) ?? "",
    endingDate: project.endingDate?.slice(0, 10) ?? "",
    currencyCode: project.currencyCode,
    blocked: blockedFromLabel(project.blocked),
    externalReference: project.externalReference ?? "",
  });
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({
      description: project.description,
      customerId: project.customerId,
      projectManagerUserId: project.projectManagerUserId ?? "",
      startingDate: project.startingDate?.slice(0, 10) ?? "",
      endingDate: project.endingDate?.slice(0, 10) ?? "",
      currencyCode: project.currencyCode,
      blocked: blockedFromLabel(project.blocked),
      externalReference: project.externalReference ?? "",
    });
    void customersService.getCustomers().then(setCustomers);
  }, [open, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validation = UpdateProjectSchema.safeParse(formData);
    if (!validation.success) {
      parseZodErrors(validation.error);
      setError("Please fix the validation errors");
      return;
    }
    setIsLoading(true);
    try {
      await projectsService.updateProject(project.id, {
        ...validation.data,
        projectManagerUserId: validation.data.projectManagerUserId || undefined,
        startingDate: validation.data.startingDate || undefined,
        endingDate: validation.data.endingDate || undefined,
        externalReference: validation.data.externalReference || undefined,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>{project.projectNumber}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-customerId">Customer</Label>
              <select
                id="edit-customerId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.customerId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, customerId: e.target.value }))
                }
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-currencyCode">Currency</Label>
              <Input
                id="edit-currencyCode"
                maxLength={3}
                value={formData.currencyCode}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, currencyCode: e.target.value.toUpperCase() }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-blocked">Blocked</Label>
              <select
                id="edit-blocked"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.blocked}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    blocked: Number(e.target.value) as UpdateProjectFormData["blocked"],
                  }))
                }
              >
                <option value={ProjectBlocked.None}>None</option>
                <option value={ProjectBlocked.Posting}>Posting</option>
                <option value={ProjectBlocked.All}>All</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
