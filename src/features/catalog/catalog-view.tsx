"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteHeader } from "@/components/layout/header";
import { HaatProductGrid } from "@/features/catalog/haat-product-grid";
import { MenuCategoryStrip } from "@/features/catalog/menu-category-strip";
import { SubcategoryChips } from "@/features/catalog/subcategory-chips";
import { ProductFiltersBar } from "@/features/catalog/product-filters-bar";
import { ProductDetailDrawer } from "@/features/catalog/product-detail-drawer";
import { CatalogModifierPreviewProvider } from "@/features/catalog/catalog-modifier-preview-context";
import { useProducts, useAllProducts, useCategories } from "@/hooks/useProducts";
import { CatalogAccessError, isCatalogAccessError } from "@/features/catalog/catalog-access-error";
import { useT, useLocale } from "@/components/providers/locale-provider";
import { useLocalizedCategory } from "@/hooks/useLocalizedContent";
import {
  filterMenuProducts,
  getRootCategories,
  hasSubcategories,
  sortProducts,
} from "@/lib/menu/category-tree";
import { cn } from "@/lib/utils";
import type { Product, ProductFilters } from "@/types";

/**
 * HAAT-style full catalog page.
 *
 * Layout:
 *  • Sticky category strip + search + filter button under the header
 *  • Section title with product count
 *  • HAAT product grid (2/3/4 cols)
 *  • Deep links: ?category= and ?product= and ?search=
 *  • Mobile filter opens as a bottom sheet
 */
export function CatalogView() {
  const t = useT();
  const { dir } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: "popular",
    active: true,
  });
  const deepLinkApplied = useRef(false);

  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { products: allProducts, loading: allLoading, error: productsError } = useAllProducts();
  const rootCategories = useMemo(() => getRootCategories(categories), [categories]);

  const storefrontEmpty =
    !categoriesLoading &&
    !allLoading &&
    categories.length === 0 &&
    allProducts.length === 0;

  // Deep links (?category=, ?product=, ?search=) — applied once.
  useEffect(() => {
    if (deepLinkApplied.current) return;
    if (typeof window === "undefined") return;
    if (categories.length === 0 && allProducts.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    const productId = params.get("product");
    const search = params.get("search");

    if (search) {
      setSearchQuery(search);
      deepLinkApplied.current = true;
    } else if (categoryId && categories.some((c) => c.id === categoryId)) {
      setSelectedCategoryId(categoryId);
      setSelectedSubcategoryId(null);
      deepLinkApplied.current = true;
    } else if (productId) {
      const product = allProducts.find((p) => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        deepLinkApplied.current = true;
      }
    }
  }, [allProducts, categories]);

  const isSearchMode = searchQuery.trim().length > 0;

  const combinedFilters = useMemo<ProductFilters>(
    () => ({
      ...filters,
      search: searchQuery || undefined,
      categoryId: isSearchMode ? undefined : selectedCategoryId ?? undefined,
      subcategoryId: isSearchMode ? undefined : selectedSubcategoryId ?? undefined,
      active: true,
    }),
    [filters, searchQuery, isSearchMode, selectedCategoryId, selectedSubcategoryId]
  );

  const { products: searchProducts, loading: searchLoading } = useProducts(
    isSearchMode ? combinedFilters : undefined
  );

  const menuProducts = useMemo(() => {
    if (isSearchMode) return sortProducts(searchProducts);
    if (!selectedCategoryId) return sortProducts(allProducts.filter((p) => p.active));
    const filtered = filterMenuProducts(
      allProducts,
      selectedCategoryId,
      selectedSubcategoryId,
      categories
    );
    return sortProducts(filtered);
  }, [
    isSearchMode,
    searchProducts,
    allProducts,
    selectedCategoryId,
    selectedSubcategoryId,
    categories,
  ]);

  const loading = isSearchMode ? searchLoading : allLoading;

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;
  const selectedSub = selectedSubcategoryId
    ? categories.find((c) => c.id === selectedSubcategoryId) ?? null
    : null;
  const localized = useLocalizedCategory(selectedSub ?? selectedCategory);

  const sectionTitle = useMemo(() => {
    if (isSearchMode) return `"${searchQuery}"`;
    if (!selectedCategoryId) return t("catalog.allProducts", "جميع المنتجات");
    return localized.name || t("catalog.menuSection", "תפריט");
  }, [isSearchMode, searchQuery, selectedCategoryId, localized.name, t]);

  const showProducts =
    isSearchMode ||
    !selectedCategoryId ||
    !hasSubcategories(categories, selectedCategoryId) ||
    selectedSubcategoryId;

  const needsSubcategoryPick =
    !isSearchMode &&
    selectedCategoryId &&
    hasSubcategories(categories, selectedCategoryId) &&
    !selectedSubcategoryId;

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
    requestAnimationFrame(() => {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleSubcategorySelect = useCallback((subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
  }, []);

  const accessError = productsError || categoriesError;
  if (
    !categoriesLoading &&
    !allLoading &&
    accessError &&
    (isCatalogAccessError(accessError) || storefrontEmpty)
  ) {
    return <CatalogAccessError />;
  }

  if (storefrontEmpty) {
    return (
      <CatalogModifierPreviewProvider>
        <>
          <SiteHeader />
          <section className="haat-container flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ds-primary/10 text-ds-primary">
              <Search className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <h1 className="text-xl font-semibold text-ds-text">
              {t("catalog.emptyStoreTitle", "אנחנו מכינים את החנות בשבילכם")}
            </h1>
            <p className="text-sm text-ds-text-muted">
              {t(
                "catalog.emptyStoreBody",
                "בקרוב כאן יופיעו המוצרים והקטגוריות. חזרו בקרוב."
              )}
            </p>
          </section>
        </>
      </CatalogModifierPreviewProvider>
    );
  }

  return (
    <CatalogModifierPreviewProvider>
      <>
        <SiteHeader />

        {/* Hero-less catalog — jump straight to categories + products */}
        <div className="haat-container pb-12 pt-4 md:pt-5">
          <header className="mb-3 text-start">
            <h1 className="font-display text-2xl font-bold text-[#6E2132] md:text-[1.75rem]">
              {t("catalog.sweetsTitle", "حلوياتنا")}
            </h1>
            <p className="mt-1 text-sm text-[#6B5346]">
              {t("catalog.sweetsSubtitle", "تشكيلة من الحلويات الشرقية المحضّرة بعناية")}
            </p>
          </header>
          {/* Sticky toolbar — search + category chips */}
          <div className="sticky top-14 z-30 -mx-4 border-b border-ds-border bg-ds-bg/95 px-4 pb-3 pt-3 backdrop-blur md:top-16 md:mx-0 md:rounded-2xl md:border md:px-5 md:py-4 md:shadow-[0_1px_2px_rgba(16,14,12,0.04)]">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ds-text-muted"
                  strokeWidth={1.75}
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("header.search", "חיפוש בתפריט...")}
                  aria-label={t("header.search")}
                  dir={dir}
                  className="h-11 w-full rounded-full border border-ds-border bg-ds-surface ps-10 pe-4 text-sm text-ds-text outline-none transition-colors focus:border-ds-primary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label={t("common.clear", "נקה")}
                    className="absolute end-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ds-text-muted hover:bg-ds-surface-muted"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                aria-label={t("filters.title", "סינון")}
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-ds-border bg-ds-surface px-3.5 text-sm font-medium text-ds-text hover:border-ds-primary hover:text-ds-primary md:px-4"
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">{t("filters.title", "סינון")}</span>
              </button>
            </div>

            {rootCategories.length > 0 && !isSearchMode && (
              <div className="mt-3">
                <MenuCategoryStrip
                  selectedId={selectedCategoryId}
                  onSelect={handleCategorySelect}
                />
                <SubcategoryChips
                  parentId={selectedCategoryId}
                  selectedSubId={selectedSubcategoryId}
                  onSelect={handleSubcategorySelect}
                />
              </div>
            )}
          </div>

          <div id="menu" className="mt-4 scroll-mt-32">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-[#3E2A1F]" dir={localized.dir}>
                  {sectionTitle}
                </h2>
                {selectedCategoryId && !isSearchMode && (
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(null)}
                    className="mt-1 text-xs text-ds-text-muted hover:text-ds-primary"
                  >
                    ← {t("catalog.allProducts", "כל המוצרים")}
                  </button>
                )}
              </div>
              {showProducts && (
                <span className="shrink-0 text-xs text-ds-text-muted">
                  {loading
                    ? "..."
                    : `${menuProducts.length} ${t("catalog.productsCount", "פריטים")}`}
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {needsSubcategoryPick ? (
                <motion.p
                  key="pick-sub"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center text-sm text-ds-text-muted"
                >
                  {t("catalog.pickSubcategory", "בחרו תת־קטגוריה כדי לראות את המוצרים")}
                </motion.p>
              ) : (
                <motion.div
                  key={`${selectedCategoryId}-${selectedSubcategoryId}-${searchQuery}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HaatProductGrid
                    products={menuProducts}
                    loading={loading}
                    onProductClick={setSelectedProduct}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Filters bottom-sheet (mobile) / drawer (desktop) ─── */}
        <AnimatePresence>
          {filtersOpen && (
            <>
              <motion.div
                key="f-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFiltersOpen(false)}
                className="fixed inset-0 z-[80] bg-black/40"
              />
              <motion.aside
                key="f-sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "fixed inset-x-0 bottom-0 z-[81] flex max-h-[85dvh] flex-col rounded-t-3xl bg-ds-surface shadow-2xl",
                  "md:inset-y-0 md:bottom-auto md:top-0 md:max-h-none md:w-[380px] md:rounded-none",
                  dir === "rtl" ? "md:left-0 md:right-auto" : "md:left-auto md:right-0"
                )}
              >
                <div className="flex items-center justify-between border-b border-ds-border px-5 py-3">
                  <h3 className="text-base font-semibold text-ds-text">
                    {t("filters.title", "סינון")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ds-text-muted hover:bg-ds-surface-muted"
                    aria-label={t("common.close")}
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
                  <ProductFiltersBar
                    filters={combinedFilters}
                    onFiltersChange={setFilters}
                    showFilters
                    onToggleFilters={() => {}}
                  />
                </div>
                <div className="border-t border-ds-border px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="h-11 w-full rounded-full bg-ds-primary text-sm font-semibold text-ds-text-on-primary hover:bg-ds-primary-hover"
                  >
                    {t("filters.apply", "הצג תוצאות")}
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <ProductDetailDrawer
          product={selectedProduct}
          open={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
          onSelectProduct={setSelectedProduct}
        />
      </>
    </CatalogModifierPreviewProvider>
  );
}
