"use client";

import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Typographic opening for the sweets menu.
 * Used when the store has no photographic hero yet.
 */
export function BrandHeroPanel({
  eyebrow,
  title,
  subtitle,
  cta,
  href,
  onCta,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  onCta?: () => void;
  compact?: boolean;
}) {
  const label = cta ? (
    <>
      {cta}
      <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" strokeWidth={2} />
    </>
  ) : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-[#E4D3B4] bg-[#FFFCF7]",
        compact ? "min-h-[200px] px-5 py-6" : "min-h-[180px] px-6 py-7 md:min-h-[240px] md:px-10 md:py-8"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -start-16 h-56 w-56 rounded-full bg-[#C9A35D]/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -end-12 h-64 w-64 rounded-full bg-[#6E2132]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A35D] to-transparent"
      />

      <div className="relative z-10 flex max-w-xl flex-col items-start gap-4">
        <Logo href={null} size="xl" className="h-24 w-auto md:h-28" />
        {eyebrow ? (
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#A89B68]">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-3xl font-bold leading-tight text-[#6E2132] md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-md text-sm leading-relaxed text-[#3E2A1F]/80 md:text-base">{subtitle}</p>
        ) : null}
        {label && href ? (
          <Button asChild size="lg" className="mt-2 h-11 rounded-full px-6">
            <a href={href}>{label}</a>
          </Button>
        ) : null}
        {label && !href ? (
          <Button size="lg" className="mt-2 h-11 rounded-full px-6" onClick={onCta}>
            {label}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function isDecorativeHeroImage(src: string | null | undefined): boolean {
  if (!src) return true;
  const value = src.trim();
  if (!value) return true;
  return (
    value.endsWith(".svg") ||
    value.includes("/brand/") ||
    value.includes("meskahphoto") ||
    value === "/store.jpg" ||
    value === "/logo.png"
  );
}
