import { useState, useCallback, useEffect, useRef } from "react";
import { QuerySpec, PaginatedResponse } from "@/types/api.types";
import {
  handleApiError,
  isForbiddenError,
  getForbiddenMessage,
  getErrorMessage,
} from "@/lib/error-handling";

interface UseDataTableOptions<T> {
  fetcher: (querySpec: QuerySpec) => Promise<PaginatedResponse<T>>;
  initialQuery?: Partial<QuerySpec>;
  resourceName: string;
}

export function useDataTable<T>({
  fetcher,
  initialQuery,
  resourceName,
}: UseDataTableOptions<T>) {
  const [data, setData] = useState<PaginatedResponse<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [querySpec, setQuerySpec] = useState<QuerySpec>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
    sortBy: "createdAt",
    sortDesc: true,
    ...initialQuery,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(querySpec);
      setData(result);
    } catch (err: unknown) {
      const apiError = handleApiError(err);
      if (isForbiddenError(apiError)) {
        setError(getForbiddenMessage(resourceName));
      } else {
        setError(getErrorMessage(apiError, `Failed to fetch ${resourceName}`));
      }
    } finally {
      setIsLoading(false);
    }
  }, [querySpec, resourceName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setQuerySpec(prev => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleSort = (field: string) => {
    setQuerySpec(prev => ({
      ...prev,
      sortBy: field,
      sortDesc: prev.sortBy === field ? !prev.sortDesc : false,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQuerySpec(prev => ({ ...prev, page: newPage }));
  };

  return {
    data,
    isLoading,
    error,
    querySpec,
    setQuerySpec,
    handleSearch,
    handleSort,
    handlePageChange,
    setError,
    refresh: fetchData,
  };
}
