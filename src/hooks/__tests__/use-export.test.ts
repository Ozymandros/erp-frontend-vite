import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useExport } from "../use-export";
import * as exportUtils from "@/lib/export.utils";

vi.mock("@/lib/export.utils", () => ({
  downloadBlob: vi.fn().mockResolvedValue(undefined),
}));

describe("useExport", () => {
  const mockOnExport = vi.fn().mockResolvedValue(new Blob(["test"], { type: "text/plain" }));

  it("should handle successful export", async () => {
    const { result } = renderHook(() =>
      useExport({
        resourceName: "Test",
        onExport: mockOnExport,
      })
    );

    expect(result.current.isExporting).toBe(false);

    await act(async () => {
      await result.current.handleExport("xlsx");
    });

    expect(mockOnExport).toHaveBeenCalledWith("xlsx");
    expect(exportUtils.downloadBlob).toHaveBeenCalled();
    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportError).toBeNull();
  });

  it("should handle export failure", async () => {
    const error = new Error("Export failed");
    const failingExport = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useExport({
        resourceName: "Test",
        onExport: failingExport,
      })
    );

    await act(async () => {
      await result.current.handleExport("pdf");
    });

    expect(result.current.exportError).toBeTruthy();
    expect(result.current.isExporting).toBe(false);
  });
});
