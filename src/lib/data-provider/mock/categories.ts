/**
 * Mock category service. Mirrors the public signatures of
 * `src/services/categoryService.ts`.
 */
import { type ServiceResult, success, failure, ServiceError } from "@/lib/errors";
import { categorySchema, type CategoryInput } from "@/lib/validation/schemas";
import type { Category } from "@/types";
import { mockStore, mockId } from "./store";

export type Unsubscribe = () => void;

function readAll(): Category[] {
  return mockStore.getSnapshot("categories");
}

function writeAll(next: Category[]): void {
  mockStore.setCollection("categories", next);
}

function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategories(options?: {
  includeInactive?: boolean;
}): Promise<Category[]> {
  const all = sortCategories(readAll());
  return options?.includeInactive ? all : all.filter((c) => c.active !== false);
}

export async function getAllCategoriesForExport(): Promise<Category[]> {
  return sortCategories(readAll());
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return readAll().find((c) => c.id === id);
}

export function subscribeToCategories(
  onData: (categories: Category[]) => void,
  _onError: (error: string) => void,
  options?: { includeInactive?: boolean }
): Unsubscribe {
  return mockStore.subscribe("categories", () => {
    try {
      const all = sortCategories(readAll());
      onData(options?.includeInactive ? all : all.filter((c) => c.active !== false));
    } catch (error) {
      _onError(error instanceof Error ? error.message : "Mock subscription failed");
    }
  });
}

export async function createCategory(
  input: CategoryInput
): Promise<ServiceResult<Category>> {
  try {
    const parsed = categorySchema.parse(input);
    const category: Category = {
      id: mockId("cat"),
      name_he: parsed.nameHe,
      name_ar: parsed.nameAr,
      name_en: parsed.nameEn,
      icon: parsed.icon,
      image: parsed.imageUrl ?? "",
      color: parsed.color,
      sortOrder: parsed.sortOrder,
      active: parsed.active,
      parentId: parsed.parentId || null,
    };
    writeAll([...readAll(), category]);
    return success(category);
  } catch (error) {
    return failure(error, "Failed to create category");
  }
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Promise<ServiceResult<Category>> {
  try {
    const list = readAll();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      return failure(new ServiceError("Category not found", "NOT_FOUND"));
    }
    const existing = list[index]!;
    const merged: Category = {
      ...existing,
      ...(input.nameHe !== undefined ? { name_he: input.nameHe } : {}),
      ...(input.nameAr !== undefined ? { name_ar: input.nameAr } : {}),
      ...(input.nameEn !== undefined ? { name_en: input.nameEn } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
      ...(input.imageUrl !== undefined ? { image: input.imageUrl } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId || null } : {}),
    };
    list[index] = merged;
    writeAll(list);
    return success(merged);
  } catch (error) {
    return failure(error, "Failed to update category");
  }
}

export async function deleteCategory(id: string): Promise<ServiceResult<void>> {
  try {
    writeAll(readAll().filter((c) => c.id !== id));
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to delete category");
  }
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<ServiceResult<void>> {
  try {
    const map = new Map(readAll().map((c) => [c.id, c]));
    const next: Category[] = [];
    orderedIds.forEach((id, index) => {
      const existing = map.get(id);
      if (existing) {
        next.push({ ...existing, sortOrder: index + 1 });
        map.delete(id);
      }
    });
    for (const remaining of map.values()) next.push(remaining);
    writeAll(next);
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to reorder categories");
  }
}

export async function readOneCategoryForTest(): Promise<ServiceResult<Category | null>> {
  const list = readAll();
  return success(list[0] ?? null);
}
