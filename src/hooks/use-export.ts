import { useState } from "react";
import { handleApiError, getErrorMessage } from "@/lib/error-handling";
import { downloadBlob } from "@/lib/export.utils";

interface ExportOptions {
  resourceName: string;
  onExport: (format: "xlsx" | "pdf") => Promise<Blob>;
}

export function useExport({ resourceName, onExport }: ExportOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async (format: "xlsx" | "pdf") => {
    setIsExporting(true);
    setExportError(null);
    try {
      const blob = await onExport(format);
      await downloadBlob(blob, `${resourceName}.${format}`);
    } catch (err) {
      const apiError = handleApiError(err);
      setExportError(getErrorMessage(apiError, `Failed to export ${resourceName} to ${format}`));
    } finally {
      setIsExporting(false);
    }
  };

  return { handleExport, isExporting, exportError };
}
