import { useState } from "react";
import { projectTasksService } from "@/api/services/project-tasks.service";
import type { ProjectTaskDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteProjectTaskDialogProps {
  readonly projectId: string;
  readonly task: ProjectTaskDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function DeleteProjectTaskDialog({
  projectId,
  task,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProjectTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
        </DialogHeader>
        <p className="text-sm">
          {task.taskNo} — {task.description}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                await projectTasksService.deleteTask(projectId, task.id);
                onSuccess();
                onOpenChange(false);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
