import { cn } from "@/lib/utils";

interface JsonViewerProps {
  readonly value: string | null | undefined;
  readonly className?: string;
  readonly compact?: boolean;
  readonly emptyLabel?: string;
}

function formatJsonValue(value: string | null | undefined): string {
  if (value == null || value.trim() === "") {
    return "";
  }
  const trimmed = value.trim();
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return trimmed;
  }
}

export function JsonViewer({
  value,
  className,
  compact = false,
  emptyLabel = "—",
}: JsonViewerProps) {
  const formatted = formatJsonValue(value);

  if (!formatted) {
    return (
      <span className="text-sm text-muted-foreground">{emptyLabel}</span>
    );
  }

  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-md border border-border bg-muted p-3 text-xs text-foreground font-mono",
        compact ? "max-h-32" : "max-h-96",
        className,
      )}
    >
      {formatted}
    </pre>
  );
}

interface JsonCellProps {
  readonly value: string | null;
  readonly compactThreshold?: number;
}

/** Renders a property value inline or as compact JSON when long or JSON-shaped. */
export function JsonCell({ value, compactThreshold = 80 }: JsonCellProps) {
  if (value == null || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  const isLong = value.length > compactThreshold;
  const looksLikeJson =
    value.trim().startsWith("{") || value.trim().startsWith("[");

  if (isLong || looksLikeJson) {
    return <JsonViewer value={value} compact />;
  }

  return <span className="text-sm break-all">{value}</span>;
}
