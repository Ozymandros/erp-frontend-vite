"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { OpportunityDto } from "@/types/api.types";
import { crmOpportunitiesService } from "@/api/services/crm-opportunities.service";
import { UpdateOpportunityForecastDialog } from "@/components/crm/update-opportunity-forecast-dialog";
import { AddOpportunityLineDialog } from "@/components/crm/add-opportunity-line-dialog";

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [opportunity, setOpportunity] = useState<OpportunityDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stage, setStage] = useState<string>("");
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [isLineOpen, setIsLineOpen] = useState(false);

  const [markWonNote, setMarkWonNote] = useState<string>("");
  const [markLostReason, setMarkLostReason] = useState<string>("");

  const isOpportunityClosed = useMemo(() => {
    const normalized = opportunity?.stage?.toLowerCase().trim() ?? "";
    if (!normalized) return false;
    return normalized.includes("closed") || normalized.includes("won") || normalized.includes("lost");
  }, [opportunity?.stage]);

  const refreshOpportunity = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await crmOpportunitiesService.getOpportunityById(id);
      setOpportunity(data);
      setStage(data.stage ?? "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch opportunity");
      setOpportunity(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refreshOpportunity();
  }, [refreshOpportunity]);

  const handleMoveStage = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      await crmOpportunitiesService.moveOpportunityStage(id, { stage });
      await refreshOpportunity();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to move opportunity stage");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkWon = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      await crmOpportunitiesService.markOpportunityWon(id, {
        convertToQuote: false,
        note: markWonNote.trim() ? markWonNote.trim() : undefined,
      });
      setMarkWonNote("");
      await refreshOpportunity();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to mark opportunity as won");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkLost = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      await crmOpportunitiesService.markOpportunityLost(id, {
        reason: markLostReason.trim(),
      });
      setMarkLostReason("");
      await refreshOpportunity();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to mark opportunity as lost");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/crm/opportunities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="space-y-6">
        <Link to="/crm/opportunities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-destructive">{error || "Opportunity not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/crm/opportunities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsForecastOpen(true)}
            disabled={isOpportunityClosed}
          >
            Update Forecast
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsLineOpen(true)}
            disabled={isOpportunityClosed}
          >
            Add Line
          </Button>
        </div>
      </div>

      {isOpportunityClosed && (
        <Alert>
          <AlertDescription>
            This opportunity is closed and can no longer be modified.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{opportunity.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Stage</p>
              <p className="font-medium">{opportunity.stage}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium">{opportunity.ownerUsername}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Probability</p>
              <p className="font-medium">{opportunity.probability}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Amount</p>
              <p className="font-medium">
                {typeof opportunity.expectedAmount === "number"
                  ? opportunity.expectedAmount
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Close</p>
              <p className="font-medium">
                {opportunity.expectedCloseDate ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage & Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Input
                id="stage"
                value={stage}
                onChange={e => setStage(e.target.value)}
                disabled={isLoading || isOpportunityClosed}
              />
              <Button
                onClick={() => void handleMoveStage()}
                disabled={!stage || isOpportunityClosed}
              >
                Move Stage
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="markWonNote">Mark Won Note (optional)</Label>
              <Input
                id="markWonNote"
                value={markWonNote}
                onChange={e => setMarkWonNote(e.target.value)}
                placeholder="Optional note"
                disabled={isLoading || isOpportunityClosed}
              />
              <Button
                variant="default"
                onClick={() => void handleMarkWon()}
                disabled={isLoading || isOpportunityClosed}
              >
                Mark Won
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Mark Lost Reason *</Label>
              <Input
                id="reason"
                value={markLostReason}
                onChange={e => setMarkLostReason(e.target.value)}
                placeholder="Reason for loss"
                disabled={isLoading || isOpportunityClosed}
              />
              <Button
                variant="destructive"
                onClick={() => void handleMarkLost()}
                disabled={!markLostReason.trim() || isOpportunityClosed}
              >
                Mark Lost
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <UpdateOpportunityForecastDialog
        open={isForecastOpen}
        onOpenChange={setIsForecastOpen}
        onSuccess={refreshOpportunity}
        opportunityId={opportunity.id}
        initialData={{
          probability: opportunity.probability,
          expectedAmount: opportunity.expectedAmount,
          expectedCloseDate: opportunity.expectedCloseDate,
        }}
        isClosed={isOpportunityClosed}
      />

      {isLineOpen && (
        <AddOpportunityLineDialog
          open={isLineOpen}
          onOpenChange={setIsLineOpen}
          onSuccess={refreshOpportunity}
          opportunityId={opportunity.id}
        />
      )}
    </div>
  );
}

