"use client";

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
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/components/providers/locale-provider";
import { useLocalizedCategory } from "@/hooks/useLocalizedContent";
import { useCategories, useAllProducts } from "@/hooks/useProducts";
import { countProductsInCategory, getRootCategories } from "@/lib/menu/category-tree";
import { HorizontalScroller } from "@/components/ui/horizontal-scroller";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  coffee: Coffee,
  "cup-soda": GlassWater,
  "glass-water": GlassWater,
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
};

function CategoryPill({
  cat,
  count,
  selected,
  index,
  onSelect,
  compact,
}: {
  cat: Category;
  count: number;
  selected: boolean;
  index: number;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const localized = useLocalizedCategory(cat);
  const Icon = iconMap[cat.icon] ?? Coffee;

  return (
    <motion.button
      type="button"
      data-hscroll-active={selected ? "true" : undefined}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.02, duration: 0.2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(cat.id)}
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 rounded-full font-medium transition-all duration-200",
        compact
          ? "h-10 w-full justify-center px-2.5 text-[13px] sm:justify-start sm:px-3"
          : "h-9 flex-none shrink-0 px-3 text-sm",
        selected
          ? "bg-[#6E2132] text-[#F8F3EA] shadow-soft"
          : "border border-[#E6D7C3] bg-[#FFFCF7] text-[#3E2A1F] hover:border-[#6E2132]/40"
      )}
    >
      <Icon
        className={cn("h-4 w-4 shrink-0", selected ? "text-[#F8F3EA]" : "text-[#6E2132]/55")}
        strokeWidth={1.75}
      />
      <span dir={localized.dir} className="min-w-0 truncate">
        {localized.name}
      </span>
      <span
        className={cn(
          "shrink-0 text-xs tabular-nums",
          selected ? "text-[#F8F3EA]/80" : "text-[#6B5346]"
        )}
      >
        · {count}
      </span>
    </motion.button>
  );
}

interface MenuCategoryStripProps {
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function MenuCategoryStrip({ selectedId, onSelect }: MenuCategoryStripProps) {
  const t = useT();
  const { categories, loading } = useCategories();
  const { products } = useAllProducts();
  const rootCategories = getRootCategories(categories);

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId);
  };

  if (loading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-2 py-1 sm:grid-cols-3 md:grid-cols-4",
          "lg:flex lg:flex-nowrap lg:gap-2 lg:overflow-hidden"
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-full lg:h-9 lg:w-24 lg:shrink-0" />
        ))}
      </div>
    );
  }

  if (rootCategories.length === 0) return null;

  const allChip = (
    <button
      type="button"
      onClick={() => onSelect(null)}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-sm font-medium transition-colors",
        selectedId == null
          ? "bg-[#6E2132] text-[#F8F3EA]"
          : "border border-[#E6D7C3] bg-[#FFFCF7] text-[#3E2A1F] hover:border-[#6E2132]/40"
      )}
    >
      {t("catalog.all", "الكل")}
    </button>
  );

  return (
    <div className="py-1">
      <HorizontalScroller
        activeKey={selectedId ?? "all"}
        aria-label={t("catalog.all", "الكل")}
        fadeFromClassName="from-[#F8F3EA]"
      >
        {allChip}
        {rootCategories.map((cat, index) => (
          <CategoryPill
            key={cat.id}
            cat={cat}
            count={countProductsInCategory(products, cat.id, categories)}
            selected={selectedId === cat.id}
            index={index}
            onSelect={handleSelect}
            compact={false}
          />
        ))}
      </HorizontalScroller>
    </div>
  );
}
