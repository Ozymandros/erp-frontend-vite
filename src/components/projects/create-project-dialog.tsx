import type React from "react";
import { useEffect, useState } from "react";
import { projectsService } from "@/api/services/projects.service";
import { customersService } from "@/api/services/customers.service";
import { projectCurrenciesService } from "@/api/services/project-currencies.service";
import {
  CreateProjectSchema,
  type CreateProjectFormData,
} from "@/lib/validation/projects/project.schemas";
import { parseZodErrors } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { CustomerDto, ProjectCurrencyDto } from "@/types/api.types";

interface CreateProjectDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

const defaultForm: CreateProjectFormData = {
  description: "",
  customerId: "",
  projectManagerUserId: "",
  startingDate: "",
  endingDate: "",
  currencyCode: "",
  externalReference: "",
};

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectDialogProps) {
  const [formData, setFormData] = useState<CreateProjectFormData>(defaultForm);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [currencies, setCurrencies] = useState<ProjectCurrencyDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    void Promise.all([
      customersService.getCustomers(),
      projectCurrenciesService.getCurrencies(),
    ]).then(([c, cur]) => {
      setCustomers(c);
      setCurrencies(cur);
    });
  }, [open]);

  const handleChange = (
    field: keyof CreateProjectFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const validation = CreateProjectSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors");
      return;
    }
    setIsLoading(true);
    try {
      await projectsService.createProject({
        description: validation.data.description,
        customerId: validation.data.customerId,
        projectManagerUserId: validation.data.projectManagerUserId || undefined,
        startingDate: validation.data.startingDate || undefined,
        endingDate: validation.data.endingDate || undefined,
        currencyCode: validation.data.currencyCode || undefined,
        externalReference: validation.data.externalReference || undefined,
      });
      setFormData(defaultForm);
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>Add a new project</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
              {fieldErrors.description && (
                <p className="text-sm text-destructive">{fieldErrors.description}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <select
                id="customerId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.customerId}
                onChange={(e) => handleChange("customerId", e.target.value)}
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fieldErrors.customerId && (
                <p className="text-sm text-destructive">{fieldErrors.customerId}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currencyCode">Currency</Label>
              <select
                id="currencyCode"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.currencyCode}
                onChange={(e) => handleChange("currencyCode", e.target.value)}
              >
                <option value="">Default (local)</option>
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startingDate">Start date</Label>
                <Input
                  id="startingDate"
                  type="date"
                  value={formData.startingDate ?? ""}
                  onChange={(e) => handleChange("startingDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endingDate">End date</Label>
                <Input
                  id="endingDate"
                  type="date"
                  value={formData.endingDate ?? ""}
                  onChange={(e) => handleChange("endingDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="externalReference">External reference</Label>
              <Input
                id="externalReference"
                value={formData.externalReference ?? ""}
                onChange={(e) => handleChange("externalReference", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
