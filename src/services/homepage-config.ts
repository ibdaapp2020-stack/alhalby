/**
 * HAAT-style homepage configuration — types + defaults.
 *
 * Lives in its own file so lightweight consumers (mock data, admin UI,
 * storefront components) can import the constants without pulling in the
 * entire `settingsService.ts`, which transitively imports the client
 * Firebase SDK and bloats server-side API route bundles.
 */

/** HAAT-style home-page section identifiers. */
export type HomepageSection =
  | "hero"
  | "categories"
  | "featured"
  | "promo"
  | "new"
  | "all"
  | "about";

/** Category tile style — HAAT uses "card" by default. */
export type CategoryVariant = "card" | "circle" | "horizontal";

/** Product-card style for the storefront grid. */
export type ProductCardVariant = "haat" | "classic";

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  "hero",
  "categories",
  "featured",
  "promo",
  "new",
  "all",
  "about",
];

export interface HomepageConfig {
  /** Ordered list of visible sections, top-to-bottom. */
  sections: HomepageSection[];
  /** Section tile style for the home + catalog category grid. */
  categoryVariant: CategoryVariant;
  /** Storefront product card style. */
  productCardVariant: ProductCardVariant;
}

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  sections: DEFAULT_HOMEPAGE_SECTIONS,
  categoryVariant: "card",
  productCardVariant: "haat",
};

/** Sanitise untrusted input (e.g. Firestore data) into a valid config. */
export function sanitizeHomepageConfig(
  input:
    | {
        sections?: unknown;
        categoryVariant?: unknown;
        productCardVariant?: unknown;
      }
    | HomepageConfig
    | undefined
    | null
): HomepageConfig {
  if (!input) return DEFAULT_HOMEPAGE_CONFIG;
  const validSections = new Set<HomepageSection>(DEFAULT_HOMEPAGE_SECTIONS);
  const sectionsRaw = Array.isArray(input.sections) ? input.sections : [];
  const sections = sectionsRaw.filter((id): id is HomepageSection =>
    validSections.has(id as HomepageSection)
  );
  return {
    sections: sections.length > 0 ? sections : DEFAULT_HOMEPAGE_SECTIONS,
    categoryVariant:
      input.categoryVariant === "circle" ||
      input.categoryVariant === "horizontal"
        ? input.categoryVariant
        : "card",
    productCardVariant:
      input.productCardVariant === "classic" ? "classic" : "haat",
  };
}
