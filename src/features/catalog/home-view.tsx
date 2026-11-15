"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/header";
import { HeroBanner } from "@/features/catalog/hero-banner";
import { HaatCategoryGrid } from "@/features/catalog/haat-category-grid";
import { HaatProductGrid } from "@/features/catalog/haat-product-grid";
import { HaatPromoBanner } from "@/features/catalog/haat-promo-banner";
import { HaatAboutSection } from "@/features/catalog/haat-about-section";
import { ProductDetailDrawer } from "@/features/catalog/product-detail-drawer";
import { CatalogModifierPreviewProvider } from "@/features/catalog/catalog-modifier-preview-context";
import { useT } from "@/components/providers/locale-provider";
import { useAllProducts, useCategories } from "@/hooks/useProducts";
import { CatalogAccessError, isCatalogAccessError } from "@/features/catalog/catalog-access-error";
import { useSettings } from "@/hooks/useSettings";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  type HomepageSection,
} from "@/services/settingsService";
import { sortProducts } from "@/lib/menu/category-tree";
import type { Product } from "@/types";

/** Max products rendered inside a single HAAT home-page section. */
const SECTION_LIMIT = 8;

/**
 * HAAT-style storefront home.
 *
 * Replaces the previous all-in-one catalog layout with discrete sections so
 * each area breathes and the mobile experience stops feeling like one giant
 * block. The full-catalog page (with sticky filters) remains available at
 * `/catalog` via {@link CatalogView}.
 */
export function HomeView() {
  const t = useT();
  const router = useRouter();
  const { products: allProducts, loading: allLoading, error: productsError } = useAllProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { settings } = useSettings();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Deep-link support: ?product=…  ?category=… navigates straight to catalog.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    const productId = params.get("product");
    if (categoryId) {
      router.replace(`/catalog?category=${encodeURIComponent(categoryId)}`);
      return;
    }
    if (productId) {
      const product = allProducts.find((p) => p.id === productId);
      if (product) setSelectedProduct(product);
    }
  }, [allProducts, router]);

  const storefrontEmpty =
    !categoriesLoading &&
    !allLoading &&
    categories.length === 0 &&
    allProducts.length === 0;

  const activeProducts = useMemo(
    () => sortProducts(allProducts.filter((p) => p.active)),
    [allProducts]
  );
  const featuredProducts = useMemo(
    () => activeProducts.filter((p) => p.isPopular),
    [activeProducts]
  );
  const newProducts = useMemo(
    () => activeProducts.filter((p) => p.isNew),
    [activeProducts]
  );

  const accessError = productsError || categoriesError;
  if (
    !categoriesLoading &&
    !allLoading &&
    accessError &&
    (isCatalogAccessError(accessError) || (categories.length === 0 && allProducts.length === 0))
  ) {
    return <CatalogAccessError />;
  }

  if (storefrontEmpty) {
    return <EmptyStorefront />;
  }

  const homepage = settings?.homepage;
  const order: HomepageSection[] =
    homepage?.sections && homepage.sections.length > 0
      ? homepage.sections
      : DEFAULT_HOMEPAGE_SECTIONS;
  const categoryVariant = homepage?.categoryVariant ?? "card";

  return (
    <CatalogModifierPreviewProvider>
      <>
        <SiteHeader />

        <div className="flex flex-col gap-10 pb-16 pt-2 md:gap-14 md:pt-4">
          {order.map((section) => {
            switch (section) {
              case "hero":
                return <HeroBanner key="hero" />;

              case "categories":
                return (
                  <section
                    key="categories"
                    id="categories"
                    className="haat-container scroll-mt-20"
                  >
                    <HaatCategoryGrid
                      variant={categoryVariant}
                      onCategoryClick={(id) =>
                        router.push(`/catalog?category=${encodeURIComponent(id)}`)
                      }
                      seeAllHref="/catalog"
                    />
                  </section>
                );

              case "featured":
                if (featuredProducts.length === 0) return null;
                return (
                  <SectionBlock
                    key="featured"
                    id="featured"
                    title={t("home.featured", "מומלצים")}
                    subtitle={t("home.featuredHint", "הנבחרים של השבוע")}
                    seeAllHref="/catalog"
                  >
                    <HaatProductGrid
                      products={featuredProducts}
                      loading={allLoading}
                      limit={SECTION_LIMIT}
                      onProductClick={setSelectedProduct}
                      silentEmpty
                    />
                  </SectionBlock>
                );

              case "promo":
                if (!settings) return null;
                return <HaatPromoBanner key="promo" href="/catalog" />;

              case "new":
                if (newProducts.length === 0) return null;
                return (
                  <SectionBlock
                    key="new"
                    id="new"
                    title={t("home.new", "חדשים בחנות")}
                    subtitle={t("home.newHint", "הגיעו עכשיו")}
                    seeAllHref="/catalog"
                  >
                    <HaatProductGrid
                      products={newProducts}
                      loading={allLoading}
                      limit={SECTION_LIMIT}
                      onProductClick={setSelectedProduct}
                      silentEmpty
                    />
                  </SectionBlock>
                );

              case "all":
                return (
                  <SectionBlock
                    key="all"
                    id="menu"
                    title={t("home.allProducts", "כל המוצרים")}
                    subtitle={t(
                      "home.allProductsHint",
                      "עיינו בכל הקטלוג וסננו לפי הקטגוריות שלכם"
                    )}
                    seeAllHref="/catalog"
                  >
                    <HaatProductGrid
                      products={activeProducts}
                      loading={allLoading}
                      limit={SECTION_LIMIT * 2}
                      onProductClick={setSelectedProduct}
                    />
                  </SectionBlock>
                );

              case "about":
                return <HaatAboutSection key="about" />;

              default:
                return null;
            }
          })}
        </div>

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

function SectionBlock({
  id,
  title,
  subtitle,
  seeAllHref,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <section id={id} className="haat-container scroll-mt-20">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="haat-section-title truncate">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-ds-text-muted">{subtitle}</p>
          )}
        </div>
        {seeAllHref && (
          <Link href={seeAllHref} className="haat-section-link shrink-0">
            {t("home.seeAll", "להצגת הכול")}
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyStorefront() {
  const t = useT();
  return (
    <CatalogModifierPreviewProvider>
      <>
        <SiteHeader />
        <section className="haat-container flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ds-primary/10 text-ds-primary">
            <ChevronRight className="h-8 w-8" strokeWidth={1.75} />
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
