"use client";

import { Plus } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { useT, useLocale } from "@/components/providers/locale-provider";
import { useLocalizedProduct } from "@/hooks/useLocalizedContent";
import { useCart } from "@/features/cart/cart-context";
import { ProductImage } from "@/components/catalog/product-image";
import type { Product } from "@/types";

interface HaatProductCardProps {
  product: Product;
  index?: number;
  onClick?: () => void;
}

/**
 * Compact boutique card for the sweets catalog.
 * Image on top, name, optional description, price, and add-to-cart.
 */
export function HaatProductCard({ product, onClick }: HaatProductCardProps) {
  const t = useT();
  const { dir } = useLocale();
  const localized = useLocalizedProduct(product);
  const { addItem, openCart } = useCart();

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

  return (
    <article
      onClick={onClick}
      dir={dir}
      className={cn(
        "boutique-product-card group flex h-full min-w-0 cursor-pointer flex-col overflow-hidden text-start",
        !product.available && "opacity-70"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3EBDD]">
        <ProductImage
          image={product.image}
          categoryId={product.categoryId}
          alt={localized.name}
          sizes="(max-width: 379px) 220px, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <div className="pointer-events-none absolute start-2 top-2 flex flex-col items-start gap-1">
          {!product.available && (
            <span className="rounded-full bg-[#3E2A1F]/80 px-2 py-0.5 text-[10px] font-semibold text-[#FFFCF7]">
              {t("catalog.unavailable", "غير متوفر")}
            </span>
          )}
          {product.available && product.isNew && (
            <span className="rounded-full bg-[#6E2132] px-2 py-0.5 text-[10px] font-semibold text-[#F8F3EA]">
              {t("catalog.newBadge", "جديد")}
            </span>
          )}
          {product.available && product.isPopular && (
            <span className="rounded-full bg-[#C9A35D] px-2 py-0.5 text-[10px] font-semibold text-[#3E2A1F]">
              {t("catalog.popularBadge", "مميز")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        <h3
          className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#3E2A1F] sm:text-sm"
          dir={localized.dir}
        >
          {localized.name}
        </h3>

        {localized.description ? (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-[#6B5346] sm:text-xs" dir={localized.dir}>
            {localized.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <p dir="ltr" className="text-start text-[15px] font-bold tabular-nums text-[#541826] sm:text-base">
              {formatPrice(product.price)}
            </p>
            {product.isWeighted ? (
              <p className="text-[10px] text-[#6B5346]">{t("catalog.weightedBadge", "حسب الوزن")}</p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.available}
          className="mt-1 flex h-9 w-full items-center justify-center gap-1.5 rounded-[14px] bg-[#6E2132] text-xs font-semibold text-[#F8F3EA] transition-colors hover:bg-[#541826] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          {t("catalog.addShort", "أضف")}
        </button>
      </div>
    </article>
  );
}
