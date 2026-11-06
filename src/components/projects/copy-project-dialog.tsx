import type React from "react";
import { useState } from "react";
import { projectsService } from "@/api/services/projects.service";
import {
  CopyProjectSchema,
  type CopyProjectFormData,
} from "@/lib/validation/projects/project.schemas";
import { parseZodErrors } from "@/lib/validation";
import type { ProjectDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CopyProjectDialogProps {
  readonly project: ProjectDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: (newProjectId: string) => void;
}

export function CopyProjectDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: CopyProjectDialogProps) {
  const [formData, setFormData] = useState<CopyProjectFormData>({
    description: `Copy of ${project.description}`,
    customerId: project.customerId,
    includePlanningLines: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CopyProjectSchema.safeParse(formData);
    if (!validation.success) {
      setError("Please fix validation errors");
      parseZodErrors(validation.error);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const created = await projectsService.copyProject(project.id, {
        description: validation.data.description,
        customerId: validation.data.customerId || undefined,
        includePlanningLines: validation.data.includePlanningLines,
      });
      onSuccess(created.id);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to copy project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Copy project</DialogTitle>
            <DialogDescription>Duplicate {project.projectNumber}</DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="copy-description">Description</Label>
              <Input
                id="copy-description"
                value={formData.description ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="includePlanningLines"
                checked={formData.includePlanningLines}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, includePlanningLines: checked }))
                }
              />
              <Label htmlFor="includePlanningLines">Include planning lines</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Copying…" : "Copy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
