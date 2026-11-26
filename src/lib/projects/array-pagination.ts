import type { PaginatedResponse, QuerySpec } from "@/types/api.types";

export function paginateArray<T>(
  all: T[],
  qs: QuerySpec,
  matchesSearch?: (item: T, term: string) => boolean
): PaginatedResponse<T> {
  const term = qs.searchTerm?.trim().toLowerCase() ?? "";
  let filtered = all;
  if (term && matchesSearch) {
    filtered = all.filter((item) => matchesSearch(item, term));
  }

  const page = qs.page ?? 1;
  const pageSize = qs.pageSize ?? 10;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}
