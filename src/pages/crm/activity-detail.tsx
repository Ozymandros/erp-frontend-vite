"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { parseZodErrors } from "@/lib/validation";
import { formatDateTime } from "@/lib/utils";
import type { ActivityDto } from "@/types/api.types";
import { crmActivitiesService } from "@/api/services/crm-activities.service";
import {
  CompleteActivitySchema,
  type CompleteActivityFormData,
} from "@/lib/validation/crm/activity.schemas";

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [activity, setActivity] = useState<ActivityDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const completeInitialData = useMemo(
    (): CompleteActivityFormData => ({
      note: undefined,
    }),
    [],
  );
  const [completeData, setCompleteData] = useState<CompleteActivityFormData>(completeInitialData);

  const refresh = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await crmActivitiesService.getActivityById(id);
      setActivity(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch activity");
      setActivity(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleComplete = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const payload: CompleteActivityFormData = {
      note: completeData.note,
    };

    const validation = CompleteActivitySchema.safeParse(payload);
    if (!validation.success) {
      setFieldErrors(parseZodErrors(validation.error));
      setFormError("Please fix the validation errors");
      return;
    }

    if (!id) return;
    setIsLoading(true);
    try {
      await crmActivitiesService.completeActivity(id, validation.data);
      setIsCompleteOpen(false);
      setCompleteData(completeInitialData);
      await refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to complete activity");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/crm/activities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="space-y-6">
        <Link to="/crm/activities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </Link>
        <div className="text-center text-destructive py-8">
          <p>{error || "Activity not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/crm/activities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="default" onClick={() => setIsCompleteOpen(true)}>
            Complete Activity
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{activity.subject}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{activity.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{activity.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due</p>
              <p className="font-medium">{formatDateTime(activity.dueAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Assigned to</p>
              <p className="font-medium">{activity.assignedToUsername}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lead ID</p>
              <p className="font-medium">{activity.leadId ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Opportunity ID</p>
              <p className="font-medium">{activity.opportunityId ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer ID</p>
              <p className="font-medium">{activity.customerId ?? "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleComplete}>
            <DialogHeader>
              <DialogTitle>Complete Activity</DialogTitle>
              <DialogDescription>Add an optional completion note.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="completeNote">Note</Label>
                <Input
                  id="completeNote"
                  value={completeData.note ?? ""}
                  onChange={e =>
                    setCompleteData(prev => ({
                      ...prev,
                      note: e.target.value ? e.target.value : undefined,
                    }))
                  }
                  disabled={isLoading}
                />
                {fieldErrors.note && (
                  <p className="text-sm text-red-500">{fieldErrors.note}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCompleteOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Completing..." : "Complete"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

