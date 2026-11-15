"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { HaatProductCard } from "./haat-product-card";
import { HaatProductGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface HaatProductGridProps {
  products: Product[];
  loading?: boolean;
  onProductClick?: (product: Product) => void;
  /** Hide empty-state when the parent wraps the grid in its own fallback. */
  silentEmpty?: boolean;
  /** Clamp how many items are shown (e.g. carousel-style on home). */
  limit?: number;
  className?: string;
}

/**
 * HAAT-style grid of {@link HaatProductCard}s.
 *
 * Breakpoints:
 *  • mobile       (< 640px): 2 columns
 *  • tablet       (≥ 640px): 3 columns
 *  • small desktop(≥ 1024px): 4 columns
 */
export function HaatProductGrid({
  products,
  loading = false,
  onProductClick,
  silentEmpty = false,
  limit,
  className,
}: HaatProductGridProps) {
  const t = useT();

  if (loading) {
    return (
      <div className={cn(className)}>
        <HaatProductGridSkeleton count={typeof limit === "number" ? limit : 8} />
      </div>
    );
  }

  const list = typeof limit === "number" ? products.slice(0, limit) : products;

  if (list.length === 0) {
    if (silentEmpty) return null;
    return (
      <EmptyState
        icon={Search}
        title={t("catalog.noProducts", "לא נמצאו מוצרים")}
        description={t("catalog.noProductsHint", "נסו לשנות את החיפוש או הקטגוריה")}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {list.map((product, index) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.28,
              delay: Math.min(index, 8) * 0.03,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <HaatProductCard
              product={product}
              index={index}
              onClick={onProductClick ? () => onProductClick(product) : undefined}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
