/**
 * Product filter + sort helpers shared by the mock and firebase providers.
 * Keeping a single implementation guarantees that search/filter semantics
 * stay in sync across backends.
 */
import type { Product, ProductFilters } from "@/types";

export function applyFilters(items: Product[], filters?: ProductFilters): Product[] {
  let result = [...items];

  if (filters?.categoryId && filters.categoryId !== "all") {
    if (filters.subcategoryId) {
      result = result.filter((p) => p.subcategoryId === filters.subcategoryId);
    } else {
      result = result.filter(
        (p) => p.categoryId === filters.categoryId && !p.subcategoryId
      );
    }
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name_he.includes(filters.search!) ||
        p.name_ar.includes(filters.search!) ||
        p.name_en.toLowerCase().includes(q) ||
        p.description_he.includes(filters.search!) ||
        p.description_ar.includes(filters.search!) ||
        p.description_en.toLowerCase().includes(q)
    );
  }

  if (filters?.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters?.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters?.isPopular) {
    result = result.filter((p) => p.isPopular);
  }

  if (filters?.isNew) {
    result = result.filter((p) => p.isNew);
  }

  if (filters?.available !== undefined) {
    result = result.filter((p) => p.available === filters.available);
  }

  if (filters?.active !== undefined) {
    result = result.filter((p) => p.active === filters.active);
  }

  switch (filters?.sortBy) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      result.sort((a, b) => a.name_en.localeCompare(b.name_en));
      break;
    case "popular":
      result.sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
      break;
    case "newest":
    default:
      // Fall through: use sortOrder when createdAt is identical (seed data).
      result.sort((a, b) => {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return diff !== 0 ? diff : a.sortOrder - b.sortOrder;
      });
      break;
  }

  return result;
}
