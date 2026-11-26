import type React from "react";
import { useState } from "react";
import { projectPlanningLinesService } from "@/api/services/project-planning-lines.service";
import {
  CreateUpdatePlanningLineSchema,
  type CreateUpdatePlanningLineFormData,
} from "@/lib/validation/projects/planning-line.schemas";
import { PlanningLineType, ProjectLineKind } from "@/types/api.types";
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

interface CreatePlanningLineDialogProps {
  readonly projectId: string;
  readonly tasks: ProjectTaskDto[];
  readonly defaultTaskId?: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreatePlanningLineDialog({
  projectId,
  tasks,
  defaultTaskId,
  open,
  onOpenChange,
  onSuccess,
}: CreatePlanningLineDialogProps) {
  const [formData, setFormData] = useState<CreateUpdatePlanningLineFormData>({
    projectTaskId: defaultTaskId ?? tasks[0]?.id ?? "",
    lineType: PlanningLineType.BudgetAndBillable,
    kind: ProjectLineKind.Resource,
    quantity: 1,
    lineDiscountPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateUpdatePlanningLineSchema.safeParse(formData);
    if (!validation.success) return;
    setIsLoading(true);
    try {
      await projectPlanningLinesService.createPlanningLine(
        projectId,
        validation.data
      );
      onSuccess();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add planning line</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="pl-task">Task</Label>
              <select
                id="pl-task"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.projectTaskId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, projectTaskId: e.target.value }))
                }
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.taskNo} — {t.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="pl-qty">Quantity</Label>
              <Input
                id="pl-qty"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    quantity: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="pl-desc">Description</Label>
              <Input
                id="pl-desc"
                value={formData.description ?? ""}
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
              Add line
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
