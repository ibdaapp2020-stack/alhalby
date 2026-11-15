"use client";

import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { isMockMode } from "@/lib/data-provider/mode";
import { useT, useLocale } from "@/components/providers/locale-provider";
import { useLocalizedProduct } from "@/hooks/useLocalizedContent";
import { useCart } from "@/features/cart/cart-context";
import { useFavorites } from "@/hooks/useFavorites";
import { ProductImage } from "@/components/catalog/product-image";
import type { Product } from "@/types";

interface HaatProductCardProps {
  product: Product;
  index?: number;
  onClick?: () => void;
}

/**
 * HAAT-style product card — vertical, image-top layout.
 *
 * Layout:
 *  ┌─────────────────────┐
 *  │  [image, 1:1 or 4:5]│   favorite (top-right)
 *  │                     │   NEW / % badges (top-left)
 *  ├─────────────────────┤
 *  │  Name                │
 *  │  Short description   │
 *  │  Price    [+ add]    │
 *  └─────────────────────┘
 *
 * Used by the HAAT home + catalog grids. The legacy horizontal
 * `ProductCard` is still exported from `product-card.tsx` for any admin
 * tooling that still relies on it.
 */
export function HaatProductCard({ product, index = 0, onClick }: HaatProductCardProps) {
  const t = useT();
  const { dir } = useLocale();
  const localized = useLocalizedProduct(product);
  const { addItem, openCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Determine "sale" state if `cost` is set above `price` wouldn't make sense;
  // instead the spec allows an optional discounted price. We treat `isPopular`
  // + `isNew` as HAAT-style tags only. True discount tags come later when the
  // Product schema gets `originalPrice`.
  const originalPrice: number | null = null;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.available) return;
    if (onClick) {
      onClick();
      return;
    }
    addItem(product);
    if (typeof window !== "undefined" && window.innerWidth < 1024) openCart();
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const fav = isFavorite(product.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ delay: (index % 8) * 0.03, duration: 0.28 }}
      onClick={onClick}
      dir={dir}
      className={cn(
        "haat-card group relative flex min-w-0 cursor-pointer flex-col overflow-hidden",
        !product.available && "opacity-60"
      )}
    >
      {/* ─── Image ─── */}
      <div className="relative aspect-square w-full overflow-hidden bg-ds-surface-muted">
        <ProductImage
          image={product.image}
          categoryId={product.categoryId}
          alt={localized.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Badges — top start */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
          <div className="flex flex-col gap-1">
            {product.isNew && (
              <Badge
                variant="new"
                className="rounded-full bg-ds-primary px-2 py-0.5 text-[10px] font-semibold text-ds-text-on-primary"
              >
                {t("catalog.newBadge", "חדש")}
              </Badge>
            )}
            {product.isPopular && (
              <Badge
                variant="popular"
                className="rounded-full bg-[#C9A35D] px-2 py-0.5 text-[10px] font-semibold text-[#3E2A1F]"
              >
                {t("catalog.popularBadge", "מומלץ")}
              </Badge>
            )}
            {product.isWeighted && (
              <Badge className="rounded-full bg-[#EFE4D1] px-2 py-0.5 text-[10px] font-semibold text-[#6E2132]">
                {t("catalog.weightedBadge", "לפי משקל")}
              </Badge>
            )}
          </div>

          {/* Favorite */}
          <button
            type="button"
            onClick={handleFavorite}
            aria-pressed={fav}
            aria-label={t("catalog.favorite", "מועדפים")}
            className={cn(
              "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ds-text-muted shadow-sm backdrop-blur transition-colors",
              fav && "text-ds-primary"
            )}
          >
            <Heart
              className={cn("h-3.5 w-3.5", fav && "fill-ds-primary text-ds-primary")}
              strokeWidth={1.75}
            />
          </button>
        </div>

        {!product.available && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-white">
            {t("catalog.unavailable", "לא זמין")}
          </div>
        )}
      </div>

      {/* ─── Body ─── */}
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-3.5">
        <h3
          className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-ds-text sm:text-sm"
          dir={localized.dir}
        >
          {localized.name}
        </h3>

        {localized.description && (
          <p
            className="line-clamp-1 text-[11px] text-ds-text-muted sm:text-xs"
            dir={localized.dir}
          >
            {localized.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-ds-primary sm:text-lg">
                {formatPrice(product.price)}
              </span>
              {isMockMode() ? (
                <span className="mt-0.5 block text-[10px] font-medium text-[#A89B68]">
                  {t("catalog.demoPrice", "מחיר הדגמה")}
                </span>
              ) : null}
              {originalPrice && originalPrice > product.price ? (
                <span className="text-xs text-ds-text-muted line-through">
                  {formatPrice(originalPrice)}
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.available}
            aria-label={t("catalog.addToCart", "הוסף לעגלה")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ds-primary text-ds-text-on-primary shadow-sm transition-transform hover:bg-ds-primary-hover hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
