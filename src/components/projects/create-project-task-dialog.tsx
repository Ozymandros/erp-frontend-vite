import type React from "react";
import { useState } from "react";
import { projectTasksService } from "@/api/services/project-tasks.service";
import {
  CreateProjectTaskSchema,
  type CreateProjectTaskFormData,
} from "@/lib/validation/projects/project-task.schemas";
import { parseZodErrors } from "@/lib/validation";
import { ProjectTaskType } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateProjectTaskDialogProps {
  readonly projectId: string;
  readonly parentTaskId?: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateProjectTaskDialog({
  projectId,
  parentTaskId,
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectTaskDialogProps) {
  const [formData, setFormData] = useState<CreateProjectTaskFormData>({
    parentTaskId: parentTaskId ?? "",
    taskNo: "",
    description: "",
    taskType: ProjectTaskType.Posting,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateProjectTaskSchema.safeParse({
      ...formData,
      parentTaskId: formData.parentTaskId || parentTaskId || undefined,
    });
    if (!validation.success) {
      setError("Invalid form");
      parseZodErrors(validation.error);
      return;
    }
    setIsLoading(true);
    try {
      await projectTasksService.createTask(projectId, {
        ...validation.data,
        parentTaskId: validation.data.parentTaskId || undefined,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="taskNo">Task no</Label>
              <Input
                id="taskNo"
                value={formData.taskNo}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, taskNo: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="taskDesc">Description</Label>
              <Input
                id="taskDesc"
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
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
