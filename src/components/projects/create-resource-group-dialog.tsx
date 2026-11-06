import type React from "react";
import { useState } from "react";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import {
  CreateUpdateResourceGroupSchema,
  type CreateUpdateResourceGroupFormData,
} from "@/lib/validation/projects/resource-group.schemas";
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

interface CreateResourceGroupDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateResourceGroupDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateResourceGroupDialogProps) {
  const [formData, setFormData] = useState<CreateUpdateResourceGroupFormData>({
    code: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateUpdateResourceGroupSchema.safeParse(formData);
    if (!validation.success) return;
    setIsLoading(true);
    try {
      await projectResourceGroupsService.createResourceGroup(validation.data);
      onSuccess();
      onOpenChange(false);
      setFormData({ code: "", name: "" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create resource group</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label htmlFor="rg-code">Code</Label>
              <Input
                id="rg-code"
                value={formData.code}
                onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="rg-name">Name</Label>
              <Input
                id="rg-name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
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
