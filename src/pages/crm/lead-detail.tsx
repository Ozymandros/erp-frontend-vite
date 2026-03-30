"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import type { LeadDto } from "@/types/api.types";
import { leadsService } from "@/api/services/leads.service";
import { QualifyLeadDialog } from "@/components/crm/qualify-lead-dialog";

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [lead, setLead] = useState<LeadDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isQualifyOpen, setIsQualifyOpen] = useState(false);

  const refreshLead = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await leadsService.getLeadById(id);
      setLead(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch lead");
      setLead(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refreshLead();
  }, [refreshLead]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link to="/crm/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading lead...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="space-y-6">
        <Link to="/crm/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </Link>
        <div className="text-center py-8">
          <p className="text-destructive">{error || "Lead not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/crm/leads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button onClick={() => setIsQualifyOpen(true)} disabled={!lead}>
            Qualify Lead
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{lead.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{lead.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Owner</p>
                <p className="font-medium">{lead.ownerUsername}</p>
              </div>
            </div>

            {lead.contactName && (
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{lead.contactName}</p>
              </div>
            )}

            {lead.contactEmail && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{lead.contactEmail}</p>
              </div>
            )}

            {lead.contactPhone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{lead.contactPhone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QualifyLeadDialog
        open={isQualifyOpen}
        onOpenChange={setIsQualifyOpen}
        onSuccess={refreshLead}
        leadId={lead.id}
      />
    </div>
  );
}

