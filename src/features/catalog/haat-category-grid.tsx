"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Coffee,
  GlassWater,
  Citrus,
  Milk,
  Snowflake,
  EggFried,
  Sandwich,
  Salad,
  Utensils,
  Croissant,
  Cake,
  IceCream,
  Star,
  Package,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/providers/locale-provider";
import { useLocalizedCategory } from "@/hooks/useLocalizedContent";
import { useCategories, useAllProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  countProductsInCategory,
  getRootCategories,
} from "@/lib/menu/category-tree";
import { normalizeImageUrl } from "@/lib/menu/placeholders";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  coffee: Coffee,
  "glass-water": GlassWater,
  "cup-soda": GlassWater,
  citrus: Citrus,
  milk: Milk,
  snowflake: Snowflake,
  "egg-fried": EggFried,
  sandwich: Sandwich,
  salad: Salad,
  utensils: Utensils,
  croissant: Croissant,
  cake: Cake,
  "ice-cream": IceCream,
  star: Star,
  package: Package,
};

export type HaatCategoryVariant = "card" | "circle" | "horizontal";

interface HaatCategoryGridProps {
  variant?: HaatCategoryVariant;
  showCount?: boolean;
  onCategoryClick?: (categoryId: string) => void;
  collapseLimit?: number;
  /** Hide the "show all" toggle (useful on dedicated categories pages). */
  alwaysExpanded?: boolean;
  /** Section-title id used by the "see all" link; falls back to #menu. */
  seeAllHref?: string;
}

function CategoryCard({
  cat,
  count,
  variant,
  showCount,
  onClick,
}: {
  cat: Category;
  count: number;
  variant: HaatCategoryVariant;
  showCount: boolean;
  onClick: () => void;
}) {
  const localized = useLocalizedCategory(cat);
  const Icon = iconMap[cat.icon] ?? Package;
  const imageSrc = normalizeImageUrl(cat.image) || "/brand/category-generic.svg";
  const tint = cat.color || "#087F83";

  if (variant === "circle") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex min-w-0 flex-col items-center gap-2"
        aria-label={localized.name}
      >
        <div
          className="relative aspect-square w-full max-w-[112px] overflow-hidden rounded-full border border-ds-border bg-ds-surface shadow-[0_1px_2px_rgba(16,14,12,0.05)] transition-shadow group-hover:shadow-[0_6px_16px_-8px_rgba(16,14,12,0.18)]"
          style={{ backgroundColor: `${tint}10` }}
        >
          <Image
            src={imageSrc}
            alt={localized.name}
            fill
            unoptimized={imageSrc.includes("firebasestorage")}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 25vw, 112px"
          />
        </div>
        <span
          dir={localized.dir}
          className="line-clamp-2 w-full text-center text-xs font-medium text-ds-text sm:text-sm"
        >
          {localized.name}
        </span>
        {showCount && (
          <span className="text-[11px] text-ds-text-muted">{count}</span>
        )}
      </button>
    );
  }

  if (variant === "horizontal") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="haat-card group flex min-w-0 items-center gap-3 p-3 text-start"
        aria-label={localized.name}
      >
        <div
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ds-surface-muted"
          style={{ backgroundColor: `${tint}14` }}
        >
          <Image
            src={imageSrc}
            alt={localized.name}
            fill
            unoptimized={imageSrc.includes("firebasestorage")}
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            dir={localized.dir}
            className="truncate text-sm font-semibold text-ds-text"
          >
            {localized.name}
          </p>
          {showCount && (
            <p className="mt-0.5 text-xs text-ds-text-muted">
              {count}
            </p>
          )}
        </div>
        <span
          aria-hidden
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ds-surface-muted text-ds-text-muted transition-colors group-hover:bg-ds-primary group-hover:text-ds-text-on-primary"
        >
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2} />
        </span>
      </button>
    );
  }

  // Default: HAAT-style square card with image + name underneath
  return (
    <button
      type="button"
      onClick={onClick}
      className="haat-card group flex min-w-0 flex-col overflow-hidden text-start"
      aria-label={localized.name}
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-ds-surface-muted"
        style={{ backgroundColor: `${tint}10` }}
      >
        <Image
          src={imageSrc}
          alt={localized.name}
          fill
          unoptimized={imageSrc.includes("firebasestorage")}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
        />
        <span
          className="absolute top-2 start-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ds-primary shadow-sm"
          aria-hidden
          style={{ color: tint }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <p
          dir={localized.dir}
          className="line-clamp-1 text-sm font-semibold text-ds-text"
        >
          {localized.name}
        </p>
        {showCount && (
          <p className="text-[11px] text-ds-text-muted">
            {count} {/* keep locale-agnostic numeric; parent passes short count */}
          </p>
        )}
      </div>
    </button>
  );
}

/**
 * HAAT-style category showcase.
 *
 * Grid responsiveness:
 *  • mobile  (<640): 2 columns
 *  • tablet  (≥640): 3 columns
 *  • small lg (≥1024): 5 columns
 *  • wide    (≥1280): 6 columns
 *
 * When there are more root categories than the collapse limit (default 6 on
 * mobile), a "Show all"/"Show less" toggle is rendered.
 */
export function HaatCategoryGrid({
  variant = "card",
  showCount = true,
  onCategoryClick,
  collapseLimit = 8,
  alwaysExpanded = false,
  seeAllHref = "#menu",
}: HaatCategoryGridProps) {
  const t = useT();
  const { categories, loading } = useCategories();
  const { products } = useAllProducts();
  const [expanded, setExpanded] = useState(false);

  const roots = useMemo(() => getRootCategories(categories), [categories]);

  const visible = useMemo(() => {
    if (alwaysExpanded || expanded) return roots;
    return roots.slice(0, collapseLimit);
  }, [roots, expanded, alwaysExpanded, collapseLimit]);

  const gridClass =
    variant === "horizontal"
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      : variant === "circle"
        ? "grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8"
        : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "w-full rounded-2xl",
              variant === "circle" ? "aspect-square" : "aspect-[4/5]"
            )}
          />
        ))}
      </div>
    );
  }

  if (roots.length === 0) return null;

  const handleSelect = (id: string) => {
    if (onCategoryClick) {
      onCategoryClick(id);
      return;
    }
    // Default: navigate to /catalog?category=…
    window.location.assign(`/catalog?category=${encodeURIComponent(id)}`);
  };

  const canToggle = !alwaysExpanded && roots.length > collapseLimit;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="haat-section-title">{t("catalog.categories", "קטגוריות")}</h2>
        <Link href={seeAllHref} className="haat-section-link">
          {t("catalog.showAll", "הצג הכול")}
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2} />
        </Link>
      </div>

      <motion.div layout className={gridClass}>
        {visible.map((cat, index) => (
          <motion.div
            key={cat.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 10) * 0.025, duration: 0.25 }}
          >
            <CategoryCard
              cat={cat}
              count={countProductsInCategory(products, cat.id, categories)}
              variant={variant}
              showCount={showCount}
              onClick={() => handleSelect(cat.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {canToggle && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="haat-chip"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                {t("catalog.showLess", "הצג פחות")}
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                {t("catalog.showAll", "הצג הכול")}
                <span className="text-ds-text-muted">
                  (+{roots.length - collapseLimit})
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
