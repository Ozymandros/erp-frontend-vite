import type React from "react";
import { useState } from "react";
import { projectsService } from "@/api/services/projects.service";
import {
  ChangeProjectStatusSchema,
  type ChangeProjectStatusFormData,
} from "@/lib/validation/projects/project.schemas";
import { parseZodErrors } from "@/lib/validation";
import { ProjectStatus } from "@/types/api.types";
import type { ProjectDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
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

interface ChangeProjectStatusDialogProps {
  readonly project: ProjectDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function ChangeProjectStatusDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: ChangeProjectStatusDialogProps) {
  const [status, setStatus] = useState<ChangeProjectStatusFormData["status"]>(
    ProjectStatus.Planning
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = ChangeProjectStatusSchema.safeParse({ status });
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await projectsService.changeProjectStatus(project.id, validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to change status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change status</DialogTitle>
            <DialogDescription>
              Current: {project.status} ({project.projectNumber})
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="py-4 space-y-2">
            <Label htmlFor="project-status">New status</Label>
            <select
              id="project-status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(Number(e.target.value) as ProjectStatus)}
            >
              <option value={ProjectStatus.Planning}>Planning</option>
              <option value={ProjectStatus.Quote}>Quote</option>
              <option value={ProjectStatus.Open}>Open</option>
              <option value={ProjectStatus.Completed}>Completed</option>
            </select>
            {fieldErrors.status && (
              <p className="text-sm text-destructive">{fieldErrors.status}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating…" : "Update status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
