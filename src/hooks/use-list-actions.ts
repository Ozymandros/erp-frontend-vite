import { useState, useCallback } from "react";

interface UseListActionsOptions {
  refresh: () => void;
}

/**
 * Custom hook to manage common state for list actions (Create, Edit, Delete).
 */
export function useListActions<T>({ refresh }: UseListActionsOptions) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  const handleCreated = useCallback(() => {
    setIsCreateOpen(false);
    refresh();
  }, [refresh]);

  const handleUpdated = useCallback(() => {
    setEditingItem(null);
    refresh();
  }, [refresh]);

  const handleDeleted = useCallback(() => {
    setDeletingItem(null);
    refresh();
  }, [refresh]);

  return {
    isCreateOpen,
    setIsCreateOpen,
    editingItem,
    setEditingItem,
    deletingItem,
    setDeletingItem,
    handleCreated,
    handleUpdated,
    handleDeleted,
  };
}
