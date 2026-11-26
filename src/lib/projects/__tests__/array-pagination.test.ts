import { describe, it, expect } from "vitest";
import { paginateArray } from "../array-pagination";

describe("paginateArray", () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: String(i), name: `item-${i}` }));

  it("paginates first page and exposes next page", () => {
    const p1 = paginateArray(items, { page: 1, pageSize: 10 }, (item, term) =>
      item.name.toLowerCase().includes(term)
    );
    expect(p1.items).toHaveLength(10);
    expect(p1.total).toBe(25);
    expect(p1.hasNextPage).toBe(true);
    expect(p1.hasPreviousPage).toBe(false);
  });

  it("filters by search term (lowercased) and paginates", () => {
    const filtered = paginateArray(
      items,
      { page: 1, pageSize: 10, searchTerm: "5" },
      (item, term) => item.id === term
    );
    expect(filtered.total).toBe(1);
    expect(filtered.items).toEqual([{ id: "5", name: "item-5" }]);
    expect(filtered.hasNextPage).toBe(false);
  });

  it("second page has previous and may have next", () => {
    const p2 = paginateArray(items, { page: 2, pageSize: 10 });
    expect(p2.items).toHaveLength(10);
    expect(p2.hasPreviousPage).toBe(true);
    expect(p2.hasNextPage).toBe(true);
  });
});
