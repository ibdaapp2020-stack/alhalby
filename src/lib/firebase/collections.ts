export const COLLECTIONS = {
  categories: "categories",
  products: "products",
  customers: "customers",
  orders: "orders",
  settings: "settings",
  banners: "banners",
  users: "users",
  uiTranslations: "ui_translations",
  assistant: "assistant",
  connectionTest: "connection-test",
  modifierGroups: "modifier_groups",
  modifierOptions: "modifier_options",
  productModifierGroups: "product_modifier_groups",
  productModifierOptions: "product_modifier_options",
  businessRules: "business_rules",
  suggestions: "suggestions",
  inventoryLinks: "inventory_links",
  pdfMenuTemplates: "pdfMenuTemplates",
  pdfMenuCategorySettings: "pdfMenuCategorySettings",
  pdfMenuProductSettings: "pdfMenuProductSettings",
  pdfMenuPages: "pdfMenuPages",
  printJobs: "printJobs",
  printAgentHeartbeats: "printAgentHeartbeats",
  coupons: "coupons",
} as const;

/**
 * Default store identifier used for multi-tenant print routing when no
 * explicit store id is passed. Override via `PRINT_STORE_ID` env var in the
 * agent configuration, or by passing an explicit id at the call site.
 */
export const DEFAULT_STORE_ID =
  process.env.PRINT_STORE_ID ?? process.env.NEXT_PUBLIC_PRINT_STORE_ID ?? "store";

export const STORAGE_PATHS = {
  products: "products",
  banners: "banners",
  categories: "categories",
  settings: "settings",
  modifiers: "modifiers",
  test: "test",
} as const;
