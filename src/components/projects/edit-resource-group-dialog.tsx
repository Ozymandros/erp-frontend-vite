import type React from "react";
import { useState } from "react";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import { CreateUpdateResourceGroupSchema } from "@/lib/validation/projects/resource-group.schemas";
import type { ResourceGroupDto } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditResourceGroupDialogProps {
  readonly group: ResourceGroupDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function EditResourceGroupDialog({
  group,
  open,
  onOpenChange,
  onSuccess,
}: EditResourceGroupDialogProps) {
  const [code, setCode] = useState(group.code);
  const [name, setName] = useState(group.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateUpdateResourceGroupSchema.safeParse({ code, name });
    if (!validation.success) return;
    setIsLoading(true);
    try {
      await projectResourceGroupsService.updateResourceGroup(
        group.id,
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
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit resource group</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
            <Input value={name} onChange={(e) => setName(e.target.value)} />
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
