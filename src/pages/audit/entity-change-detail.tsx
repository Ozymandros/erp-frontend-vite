import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { auditEntityChangesService } from "@/api/services/audit-entity-changes.service";
import type { EntityChangeDto } from "@/types/api.types";
import {
  resolvePropertyChanges,
  shouldShowPropertyChangesSection,
} from "@/lib/audit-property-changes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JsonCell, JsonViewer } from "@/components/audit/json-viewer";
import { formatDateTime } from "@/lib/utils";
import {
  getChangeTypeBadgeVariant,
  truncateEntityId,
} from "./entity-changes.columns";

function DetailField({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function EntityChangeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [change, setChange] = useState<EntityChangeDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChange = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditEntityChangesService.getEntityChangeById(id);
      setChange(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch audit entry",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChange();
  }, [fetchChange]);

  const propertyChanges = useMemo(
    () => (change ? resolvePropertyChanges(change) : []),
    [change],
  );

  const showPropertySection = change
    ? shouldShowPropertyChangesSection(change, propertyChanges)
    : false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          role="status"
          aria-label="Loading audit entry"
        />
      </div>
    );
  }

  if (error || !change) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/audit/entity-changes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to audit log
          </Link>
        </Button>
        <div className="text-center py-8 text-destructive" role="status">
          {error || "Audit entry not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/audit/entity-changes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to audit log
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit entry</h1>
        <p className="text-muted-foreground mt-1">
          {change.entityName} · {change.changeType}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Metadata for this entity change</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Entity">
              <Badge variant="outline">{change.entityName}</Badge>
            </DetailField>
            <DetailField label="Change type">
              <Badge variant={getChangeTypeBadgeVariant(change.changeType)}>
                {change.changeType}
              </Badge>
            </DetailField>
            <DetailField label="Created at">
              {formatDateTime(change.createdAt)}
            </DetailField>
            <DetailField label="Created by">{change.createdBy}</DetailField>
            <DetailField label="Updated at">
              {formatDateTime(change.updatedAt)}
            </DetailField>
            <DetailField label="Updated by">
              {change.updatedBy ?? "—"}
            </DetailField>
            <DetailField label="Entity ID">
              <span className="font-mono text-xs break-all" title={change.entityId}>
                {change.entityId}
              </span>
            </DetailField>
            <DetailField label="Record ID">
              <span className="font-mono text-xs break-all" title={change.id}>
                {truncateEntityId(change.id)}
              </span>
            </DetailField>
          </dl>
        </CardContent>
      </Card>

      {showPropertySection ? (
        <Card>
          <CardHeader>
            <CardTitle>Property changes</CardTitle>
            <CardDescription>
              Individual field-level modifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {propertyChanges.length > 0 ? (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Property</TableHead>
                      <TableHead scope="col">Original value</TableHead>
                      <TableHead scope="col">New value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyChanges.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.propertyName}
                        </TableCell>
                        <TableCell>
                          <JsonCell value={row.originalValue} />
                        </TableCell>
                        <TableCell>
                          <JsonCell value={row.newValue} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" role="status">
                No individual property changes were recorded for this entry.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Entity snapshots</CardTitle>
          <CardDescription>
            Full before and after JSON snapshots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">
                Original value
              </h3>
              <JsonViewer value={change.originalValue} emptyLabel="Empty" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">New value</h3>
              <JsonViewer value={change.newValue} emptyLabel="Empty" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
