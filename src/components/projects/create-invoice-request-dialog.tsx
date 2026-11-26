import type React from "react";
import { useState } from "react";
import { projectPostingService } from "@/api/services/project-posting.service";
import {
  CreateInvoiceRequestSchema,
  type CreateInvoiceRequestFormData,
} from "@/lib/validation/projects/posting.schemas";
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

interface CreateInvoiceRequestDialogProps {
  readonly projectId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

export function CreateInvoiceRequestDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: CreateInvoiceRequestDialogProps) {
  const [formData, setFormData] = useState<CreateInvoiceRequestFormData>({
    taxRate: 21,
    lines: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = CreateInvoiceRequestSchema.safeParse(formData);
    if (!validation.success) return;
    setIsLoading(true);
    try {
      await projectPostingService.createInvoiceRequest(projectId, validation.data);
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
            <DialogTitle>Request invoice</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Empty line list invoices all billable quantities remaining.
          </p>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="taxRate">Tax rate %</Label>
              <Input
                id="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    taxRate: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
