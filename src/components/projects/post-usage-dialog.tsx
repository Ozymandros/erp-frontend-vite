import type React from "react";
import { useState } from "react";
import { projectPostingService } from "@/api/services/project-posting.service";
import { PostUsageSchema, type PostUsageFormData } from "@/lib/validation/projects/posting.schemas";
import { ProjectLineKind } from "@/types/api.types";
import type { ProjectTaskDto } from "@/types/api.types";
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

interface PostUsageDialogProps {
  readonly projectId: string;
  readonly tasks: ProjectTaskDto[];
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function PostUsageDialog({
  projectId,
  tasks,
  open,
  onOpenChange,
  onSuccess,
}: PostUsageDialogProps) {
  const [formData, setFormData] = useState<PostUsageFormData>({
    projectTaskId: tasks[0]?.id ?? "",
    kind: ProjectLineKind.Resource,
    quantity: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = PostUsageSchema.safeParse(formData);
    if (!validation.success) return;
    setIsLoading(true);
    try {
      await projectPostingService.postUsage(projectId, validation.data);
      onSuccess();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Post usage</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="usage-task">Task</Label>
              <select
                id="usage-task"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.projectTaskId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, projectTaskId: e.target.value }))
                }
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.taskNo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="usage-qty">Quantity</Label>
              <Input
                id="usage-qty"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, quantity: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
