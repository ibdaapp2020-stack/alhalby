/**
 * Mock modifier service — all empty.
 *
 * The mock catalog doesn't ship any modifier groups, so these stubs
 * return empty arrays and no-op successes. The storefront & admin
 * screens handle empty modifier lists correctly; nothing needs to be
 * special-cased on the UI side.
 */
import { type ServiceResult, success, failure } from "@/lib/errors";
import { buildProductBuilderConfig } from "@/lib/product-builder/engine";
import type {
  ModifierGroup,
  ModifierOption,
  ProductModifierGroup,
  ProductModifierOption,
  BusinessRule,
  ProductSuggestion,
  InventoryLink,
  ProductBuilderConfig,
} from "@/types/modifiers";

export type Unsubscribe = () => void;

const noop: Unsubscribe = () => {};

// ─── Modifier Groups ───────────────────────────────────────────────

export async function getModifierGroups(_includeArchived = false): Promise<ModifierGroup[]> {
  return [];
}

export function subscribeToModifierGroups(
  onData: (groups: ModifierGroup[]) => void,
  _onError: (msg: string) => void,
  _includeArchived = false
): Unsubscribe {
  queueMicrotask(() => onData([]));
  return noop;
}

export async function createModifierGroup(
  _input: unknown
): Promise<ServiceResult<ModifierGroup>> {
  return failure(new Error("Modifier groups are not supported in mock mode"));
}

export async function updateModifierGroup(
  _id: string,
  _input: unknown
): Promise<ServiceResult<ModifierGroup>> {
  return failure(new Error("Modifier groups are not supported in mock mode"));
}

export async function deleteModifierGroup(_id: string): Promise<ServiceResult<void>> {
  return success(undefined);
}

export async function duplicateModifierGroup(
  _id: string
): Promise<ServiceResult<ModifierGroup>> {
  return failure(new Error("Modifier groups are not supported in mock mode"));
}

export async function reorderModifierGroups(_ids: string[]): Promise<ServiceResult<void>> {
  return success(undefined);
}

// ─── Modifier Options ──────────────────────────────────────────────

export async function getModifierOptions(_groupId?: string): Promise<ModifierOption[]> {
  return [];
}

export function subscribeToModifierOptions(
  _groupId: string | undefined,
  onData: (options: ModifierOption[]) => void,
  _onError: (msg: string) => void
): Unsubscribe {
  queueMicrotask(() => onData([]));
  return noop;
}

export async function createModifierOption(
  _input: unknown
): Promise<ServiceResult<ModifierOption>> {
  return failure(new Error("Modifier options are not supported in mock mode"));
}

export async function updateModifierOption(
  _id: string,
  _input: unknown
): Promise<ServiceResult<ModifierOption>> {
  return failure(new Error("Modifier options are not supported in mock mode"));
}

export async function deleteModifierOption(_id: string): Promise<ServiceResult<void>> {
  return success(undefined);
}

export async function reorderModifierOptions(
  _ids: string[]
): Promise<ServiceResult<void>> {
  return success(undefined);
}

// ─── Product ↔ Modifier links ──────────────────────────────────────

export async function getProductModifierGroups(
  _productId?: string
): Promise<ProductModifierGroup[]> {
  return [];
}

export function subscribeToProductModifierGroups(
  _productId: string | undefined,
  onData: (groups: ProductModifierGroup[]) => void,
  _onError: (msg: string) => void
): Unsubscribe {
  queueMicrotask(() => onData([]));
  return noop;
}

export function subscribeToAllProductModifierGroups(
  onData: (groups: ProductModifierGroup[]) => void,
  _onError: (msg: string) => void
): Unsubscribe {
  queueMicrotask(() => onData([]));
  return noop;
}

export async function linkProductModifierGroup(
  _input: unknown
): Promise<ServiceResult<ProductModifierGroup>> {
  return failure(new Error("Modifier links are not supported in mock mode"));
}

export async function updateProductModifierGroup(
  _id: string,
  _input: unknown
): Promise<ServiceResult<ProductModifierGroup>> {
  return failure(new Error("Modifier links are not supported in mock mode"));
}

export async function unlinkProductModifierGroup(
  _id: string
): Promise<ServiceResult<void>> {
  return success(undefined);
}

export async function syncProductModifierLinks(
  _productId: string,
  _groupIds: string[]
): Promise<ServiceResult<void>> {
  return success(undefined);
}

export async function reorderProductModifierGroups(
  _ids: string[]
): Promise<ServiceResult<void>> {
  return success(undefined);
}

export async function getProductModifierOptions(
  _productId: string
): Promise<ProductModifierOption[]> {
  return [];
}

export async function upsertProductModifierOption(
  _input: unknown
): Promise<ServiceResult<ProductModifierOption>> {
  return failure(new Error("Modifier options are not supported in mock mode"));
}

// ─── Business rules / suggestions / inventory ──────────────────────

export async function getBusinessRules(): Promise<BusinessRule[]> {
  return [];
}

export function subscribeToBusinessRules(
  onData: (rules: BusinessRule[]) => void,
  _onError: (msg: string) => void
): Unsubscribe {
  queueMicrotask(() => onData([]));
  return noop;
}

export async function createBusinessRule(
  _input: unknown
): Promise<ServiceResult<BusinessRule>> {
  return failure(new Error("Business rules are not supported in mock mode"));
}

export async function updateBusinessRule(
  _id: string,
  _input: unknown
): Promise<ServiceResult<BusinessRule>> {
  return failure(new Error("Business rules are not supported in mock mode"));
}

export async function deleteBusinessRule(_id: string): Promise<ServiceResult<void>> {
  return success(undefined);
}

export async function getProductSuggestions(
  _triggerProductId?: string
): Promise<ProductSuggestion[]> {
  return [];
}

export function subscribeToSuggestions(
  onData: (suggestions: ProductSuggestion[]) => void,
  _onError: (msg: string) => void
): Unsubscribe {
  queueMicrotask(() => onData([]));
  return noop;
}

export async function createProductSuggestion(
  _input: unknown
): Promise<ServiceResult<ProductSuggestion>> {
  return failure(new Error("Product suggestions are not supported in mock mode"));
}

export async function updateProductSuggestion(
  _id: string,
  _input: unknown
): Promise<ServiceResult<ProductSuggestion>> {
  return failure(new Error("Product suggestions are not supported in mock mode"));
}

export async function deleteProductSuggestion(
  _id: string
): Promise<ServiceResult<void>> {
  return success(undefined);
}

export async function getInventoryLinks(): Promise<InventoryLink[]> {
  return [];
}

export function subscribeToInventoryLinks(
  onData: (links: InventoryLink[]) => void,
  _onError: (msg: string) => void
): Unsubscribe {
  queueMicrotask(() => onData([]));
  return noop;
}

export async function upsertInventoryLink(
  _input: unknown
): Promise<ServiceResult<InventoryLink>> {
  return failure(new Error("Inventory links are not supported in mock mode"));
}

export async function loadProductBuilderConfig(
  productId: string
): Promise<ProductBuilderConfig> {
  return buildProductBuilderConfig({
    productId,
    groups: [],
    options: [],
    productGroups: [],
    productOptions: [],
    rules: [],
    suggestions: [],
    inventory: [],
  });
}

export function subscribeToProductBuilderConfig(
  productId: string,
  onData: (config: ProductBuilderConfig) => void,
  _onError: (msg: string) => void
): Unsubscribe {
  queueMicrotask(() =>
    onData(
      buildProductBuilderConfig({
        productId,
        groups: [],
        options: [],
        productGroups: [],
        productOptions: [],
        rules: [],
        suggestions: [],
        inventory: [],
      })
    )
  );
  return noop;
}
