"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { useT } from "@/components/providers/locale-provider";

interface HaatPromoBannerProps {
  /** Translation keys or raw strings. Falls back to generic promo copy. */
  titleKey?: string;
  subtitleKey?: string;
  ctaKey?: string;
  href?: string;
}

/**
 * Mid-page promotional banner inspired by HAAT's full-width promo cards.
 * Pure UI — pulls copy from translations so it works in he/ar/en.
 */
export function HaatPromoBanner({
  titleKey = "home.promoTitle",
  subtitleKey = "home.promoSubtitle",
  ctaKey = "home.promoCta",
  href = "#menu",
}: HaatPromoBannerProps) {
  const t = useT();

  return (
    <section className="haat-container">
      <Link
        href={href}
        className="relative flex min-h-[104px] overflow-hidden rounded-2xl bg-gradient-to-br from-ds-primary via-ds-primary to-ds-primary-hover text-ds-text-on-primary shadow-[0_12px_32px_-16px_rgba(16,14,12,0.25)] transition-transform hover:scale-[1.005] md:min-h-[128px]"
      >
        {/* Decorative circles — purely visual */}
        <span
          aria-hidden
          className="absolute -end-10 -top-20 h-56 w-56 rounded-full bg-white/10"
        />
        <span
          aria-hidden
          className="absolute end-16 bottom-[-40px] h-32 w-32 rounded-full bg-white/5"
        />
        <span
          aria-hidden
          className="absolute start-[20%] top-6 h-20 w-20 rounded-full bg-white/5 blur-xl"
        />

        <div className="relative z-10 flex w-full items-center gap-4 px-5 py-5 sm:px-8 sm:py-7 md:px-12">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Tag className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 md:text-xs">
              {t("home.promoBadge", "מבצעים")}
            </p>
            <h3 className="truncate text-base font-bold md:text-xl">
              {t(titleKey, "חסכו עד 25% על מוצרים נבחרים")}
            </h3>
            <p className="line-clamp-1 text-xs text-white/85 md:text-sm">
              {t(subtitleKey, "מבצעי השבוע — עד גמר המלאי")}
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ds-text sm:inline-flex">
            {t(ctaKey, "לרכישה")}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2} />
          </span>
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white sm:hidden"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2.5} />
          </span>
        </div>
      </Link>
    </section>
  );
}
