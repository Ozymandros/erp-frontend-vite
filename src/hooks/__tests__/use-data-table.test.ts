import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useDataTable } from "../use-data-table";

describe("useDataTable", () => {
  const mockData = {
    items: [{ id: 1, name: "Item 1" }],
    page: 1,
    pageSize: 10,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const mockFetcher = vi.fn().mockResolvedValue(mockData);

  it("should fetch data on mount", async () => {
    const { result } = renderHook(() =>
      useDataTable({
        fetcher: mockFetcher,
        resourceName: "test",
      })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockFetcher).toHaveBeenCalled();
  });

  it("should handle search", async () => {
    const { result } = renderHook(() =>
      useDataTable({
        fetcher: mockFetcher,
        resourceName: "test",
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.handleSearch("new search");
    });

    expect(result.current.querySpec.searchTerm).toBe("new search");
    expect(result.current.querySpec.page).toBe(1);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("should handle sort", async () => {
    const { result } = renderHook(() =>
      useDataTable({
        fetcher: mockFetcher,
        resourceName: "test",
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.handleSort("name");
    });

    expect(result.current.querySpec.sortBy).toBe("name");
    expect(result.current.querySpec.sortDesc).toBe(false);

    // Sort same field again
    await act(async () => {
      result.current.handleSort("name");
    });
    expect(result.current.querySpec.sortDesc).toBe(true);
  });

  it("should handle page change", async () => {
    const { result } = renderHook(() =>
      useDataTable({
        fetcher: mockFetcher,
        resourceName: "test",
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.handlePageChange(2);
    });

    expect(result.current.querySpec.page).toBe(2);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("should handle error", async () => {
    const error = new Error("Fetch failed");
    const failingFetcher = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useDataTable({
        fetcher: failingFetcher,
        resourceName: "test",
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it("should handle forbidden error", async () => {
    const { ApiClientError } = await import("@/api/clients/types");
    const error = new ApiClientError("Forbidden", 403);
    const failingFetcher = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useDataTable({
        fetcher: failingFetcher,
        resourceName: "test",
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toContain("don't have permission");
  });
});
