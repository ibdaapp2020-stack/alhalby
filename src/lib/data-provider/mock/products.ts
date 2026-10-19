/**
 * Mock implementation of the product service surface.
 *
 * Mirrors the public shape of {@link ../../../services/productService.ts}
 * so each service function can delegate here when {@link isMockMode}
 * returns true. All data flows through {@link mockStore}.
 */
import { type ServiceResult, success, failure, ServiceError } from "@/lib/errors";
import { productSchema, type ProductInput } from "@/lib/validation/schemas";
import type { Product, ProductFilters } from "@/types";
import { applyFilters } from "@/lib/data-provider/mock/filters";
import { mockStore, mockId, mockNowIso } from "./store";

export type Unsubscribe = () => void;

function readAll(): Product[] {
  return mockStore.getSnapshot("products");
}

function writeAll(next: Product[]): void {
  mockStore.setCollection("products", next);
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  return applyFilters(readAll(), filters);
}

export async function getAllProductsForExport(): Promise<Product[]> {
  return readAll().sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name_he.localeCompare(b.name_he, "he")
  );
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return readAll().find((p) => p.id === id);
}

export async function getPopularProducts(limit = 6): Promise<Product[]> {
  const products = await getProducts({ isPopular: true, available: true });
  return products.slice(0, limit);
}

export function subscribeToProducts(
  filters: ProductFilters | undefined,
  onData: (products: Product[]) => void,
  _onError: (error: string) => void
): Unsubscribe {
  return mockStore.subscribe("products", () => {
    try {
      onData(applyFilters(readAll(), filters));
    } catch (error) {
      _onError(error instanceof Error ? error.message : "Mock subscription failed");
    }
  });
}

export async function createProduct(input: ProductInput): Promise<ServiceResult<Product>> {
  try {
    const parsed = productSchema.parse(input);
    const now = mockNowIso();
    const product: Product = {
      id: mockId("prod"),
      name_he: parsed.nameHe,
      name_ar: parsed.nameAr,
      name_en: parsed.nameEn,
      description_he: parsed.descriptionHe,
      description_ar: parsed.descriptionAr,
      description_en: parsed.descriptionEn,
      categoryId: parsed.categoryId,
      subcategoryId: parsed.subcategoryId || null,
      price: parsed.price,
      cost: parsed.cost,
      profit: parsed.profit,
      businessType: parsed.businessType,
      image: parsed.imageUrl,
      isPopular: parsed.popular,
      isNew: parsed.newProduct,
      available: parsed.available,
      active: parsed.active,
      sortOrder: parsed.sortOrder || readAll().length + 1,
      createdAt: now,
      updatedAt: now,
    };
    writeAll([...readAll(), product]);
    return success(product);
  } catch (error) {
    return failure(error, "Failed to create product");
  }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<ServiceResult<Product>> {
  try {
    const products = readAll();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return failure(new ServiceError("Product not found", "NOT_FOUND"));
    }
    const existing = products[index]!;
    const merged: Product = {
      ...existing,
      ...(input.nameHe !== undefined ? { name_he: input.nameHe } : {}),
      ...(input.nameAr !== undefined ? { name_ar: input.nameAr } : {}),
      ...(input.nameEn !== undefined ? { name_en: input.nameEn } : {}),
      ...(input.descriptionHe !== undefined ? { description_he: input.descriptionHe } : {}),
      ...(input.descriptionAr !== undefined ? { description_ar: input.descriptionAr } : {}),
      ...(input.descriptionEn !== undefined ? { description_en: input.descriptionEn } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.subcategoryId !== undefined
        ? { subcategoryId: input.subcategoryId || null }
        : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.cost !== undefined ? { cost: input.cost } : {}),
      ...(input.profit !== undefined ? { profit: input.profit } : {}),
      ...(input.businessType !== undefined ? { businessType: input.businessType } : {}),
      ...(input.imageUrl !== undefined ? { image: input.imageUrl } : {}),
      ...(input.popular !== undefined ? { isPopular: input.popular } : {}),
      ...(input.newProduct !== undefined ? { isNew: input.newProduct } : {}),
      ...(input.available !== undefined ? { available: input.available } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      updatedAt: mockNowIso(),
    };
    products[index] = merged;
    writeAll(products);
    return success(merged);
  } catch (error) {
    return failure(error, "Failed to update product");
  }
}

export async function deleteProduct(id: string): Promise<ServiceResult<void>> {
  try {
    writeAll(readAll().filter((p) => p.id !== id));
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to delete product");
  }
}

export async function reorderProducts(
  orderedIds: string[]
): Promise<ServiceResult<void>> {
  try {
    const map = new Map(readAll().map((p) => [p.id, p]));
    const next: Product[] = [];
    orderedIds.forEach((id, index) => {
      const existing = map.get(id);
      if (existing) {
        next.push({ ...existing, sortOrder: index + 1, updatedAt: mockNowIso() });
        map.delete(id);
      }
    });
    // Keep any products not in the ordered list at the end.
    for (const remaining of map.values()) next.push(remaining);
    writeAll(next);
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to reorder products");
  }
}

export async function readOneProductForTest(): Promise<ServiceResult<Product | null>> {
  const products = readAll();
  return success(products[0] ?? null);
}
