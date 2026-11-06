import { useState } from "react";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import type { ResourceGroupDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteResourceGroupDialogProps {
  readonly group: ResourceGroupDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function DeleteResourceGroupDialog({
  group,
  open,
  onOpenChange,
  onSuccess,
}: DeleteResourceGroupDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete group</DialogTitle>
        </DialogHeader>
        <p className="text-sm">
          {group.code} — {group.name}
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
                await projectResourceGroupsService.deleteResourceGroup(group.id);
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
