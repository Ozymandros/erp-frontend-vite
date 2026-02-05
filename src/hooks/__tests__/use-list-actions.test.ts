import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useListActions } from "../use-list-actions";

describe("useListActions", () => {
  const mockRefresh = vi.fn();

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useListActions({ refresh: mockRefresh }));

    expect(result.current.isCreateOpen).toBe(false);
    expect(result.current.editingItem).toBeNull();
    expect(result.current.deletingItem).toBeNull();
  });

  it("should handle create success", () => {
    const { result } = renderHook(() => useListActions({ refresh: mockRefresh }));

    act(() => {
      result.current.setIsCreateOpen(true);
    });
    expect(result.current.isCreateOpen).toBe(true);

    act(() => {
      result.current.handleCreated();
    });

    expect(result.current.isCreateOpen).toBe(false);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should handle update success", () => {
    const { result } = renderHook(() => useListActions({ refresh: mockRefresh }));
    const item = { id: 1, name: "Test" };

    act(() => {
      result.current.setEditingItem(item);
    });
    expect(result.current.editingItem).toEqual(item);

    act(() => {
      result.current.handleUpdated();
    });

    expect(result.current.editingItem).toBeNull();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should handle delete success", () => {
    const { result } = renderHook(() => useListActions({ refresh: mockRefresh }));
    const item = { id: 1, name: "Test" };

    act(() => {
      result.current.setDeletingItem(item);
    });
    expect(result.current.deletingItem).toEqual(item);

    act(() => {
      result.current.handleDeleted();
    });

    expect(result.current.deletingItem).toBeNull();
    expect(mockRefresh).toHaveBeenCalled();
  });
});
