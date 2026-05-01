"use client";

import { useEffect, useState, type FormEvent } from "react";
import { invoicesService } from "@/api/services/invoices.service";
import {
  CreateCreditNoteSchema,
  type CreateCreditNoteFormData,
} from "@/lib/validation/billing/invoice.schemas";
import { parseZodErrors } from "@/lib/validation/zod-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface CreateCreditNoteDialogProps {
  readonly open: boolean;
  readonly invoiceId: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

type CreditLineInput = CreateCreditNoteFormData["lines"][number];

const DEFAULT_LINE: CreditLineInput = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  discount: 0,
};

export function CreateCreditNoteDialog({
  open,
  invoiceId,
  onOpenChange,
  onSuccess,
}: CreateCreditNoteDialogProps) {
  const [formData, setFormData] = useState<CreateCreditNoteFormData>({
    reason: "",
    lines: [],
  });
  const [lineInput, setLineInput] = useState<CreditLineInput>(DEFAULT_LINE);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData({
      reason: "",
      lines: [],
    });
    setLineInput(DEFAULT_LINE);
    setFieldErrors({});
    setError(null);
  }, [open]);

  const handleAddLine = () => {
    if (!lineInput.description.trim()) return;
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, lineInput],
    }));
    setLineInput(DEFAULT_LINE);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const validation = CreateCreditNoteSchema.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setError("Please fix the validation errors.");
      return;
    }

    setIsLoading(true);
    try {
      await invoicesService.createCreditNote(invoiceId, validation.data);
      onSuccess();
      onOpenChange(false);
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create credit note."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Credit Note</DialogTitle>
            <DialogDescription>
              Register a credit note against this invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    reason: event.target.value,
                  }))
                }
              />
              {fieldErrors.reason && (
                <p className="text-sm text-red-500">{fieldErrors.reason}</p>
              )}
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <p className="font-medium">Credit Lines</p>
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label htmlFor="description" className="text-xs">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={lineInput.description}
                    onChange={(event) =>
                      setLineInput((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="quantity" className="text-xs">
                    Qty
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={lineInput.quantity}
                    onChange={(event) =>
                      setLineInput((prev) => ({
                        ...prev,
                        quantity: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="unitPrice" className="text-xs">
                    Unit
                  </Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min={0}
                    value={lineInput.unitPrice}
                    onChange={(event) =>
                      setLineInput((prev) => ({
                        ...prev,
                        unitPrice: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="taxRate" className="text-xs">
                    Tax
                  </Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min={0}
                    value={lineInput.taxRate}
                    onChange={(event) =>
                      setLineInput((prev) => ({
                        ...prev,
                        taxRate: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAddLine}
                    aria-label="Add credit line"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.lines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No lines added.
                        </TableCell>
                      </TableRow>
                    ) : (
                      formData.lines.map((line, index) => (
                        <TableRow key={`${line.description}-${index}`}>
                          <TableCell>{line.description}</TableCell>
                          <TableCell className="text-right">{line.quantity}</TableCell>
                          <TableCell className="text-right">{line.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{line.taxRate.toFixed(2)}%</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  lines: prev.lines.filter((_, lineIndex) => lineIndex !== index),
                                }))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit" disabled={isLoading || formData.lines.length === 0}>
              {isLoading ? "Creating..." : "Create Credit Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
