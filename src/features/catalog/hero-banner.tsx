"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BRAND, displayStoreName, getStoreImageSrc } from "@/lib/brand";
import { normalizeImageUrl } from "@/lib/menu/placeholders";
import { BrandHeroPanel, isDecorativeHeroImage } from "@/features/catalog/brand-hero-panel";
import { useLocale, useT } from "@/components/providers/locale-provider";
import { useSettings } from "@/hooks/useSettings";
import { useBanners } from "@/hooks/useProducts";
import { BannerHero } from "@/features/catalog/banner-hero";

/**
 * HAAT-style hero banner.
 *
 * Layout — unified single-image hero with an overlay card.
 * Heights per spec:
 *  • Mobile:  240 → 320 px
 *  • Desktop: 380 → 460 px
 *
 * If Admin → Banners has one or more active banners we delegate to the
 * {@link BannerHero} slider, otherwise we render the default hero built from
 * settings (store name + hero image).
 */
export function HeroBanner() {
  const t = useT();
  const { locale } = useLocale();
  const { settings, loading: settingsLoading } = useSettings();
  const { banners, loading: bannersLoading } = useBanners();
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(
      () => setBannerIndex((current) => (current + 1) % banners.length),
      6000
    );
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (bannerIndex >= banners.length) setBannerIndex(0);
  }, [bannerIndex, banners.length]);

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (settingsLoading || bannersLoading) {
    return (
      <section className="haat-container mt-3 md:mt-6">
        <Skeleton className="h-[240px] w-full rounded-2xl md:h-[380px] lg:h-[440px]" />
      </section>
    );
  }

  const activeBanner = banners[bannerIndex];
  if (activeBanner) {
    return (
      <section className="haat-container relative mt-3 md:mt-6">
        <div className="md:hidden">
          <BannerHero banner={activeBanner} device="mobile" />
        </div>
        <div className="hidden md:block">
          <BannerHero banner={activeBanner} device="desktop" />
        </div>
        {banners.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setBannerIndex(index)}
                aria-label={`${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === bannerIndex
                    ? "w-6 bg-ds-text-on-primary"
                    : "w-2 bg-ds-text-on-primary/60"
                }`}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  const rawImageSrc = getStoreImageSrc(settings?.storeImageUrl);
  const imageSrc = normalizeImageUrl(rawImageSrc);

  if (!imageSrc || isDecorativeHeroImage(imageSrc)) {
    return (
      <section className="haat-container mt-3 md:mt-6">
        <BrandHeroPanel
          eyebrow={displayStoreName(locale, settings?.storeName ?? BRAND.name)}
          title={t("hero.headline", "ממתקים מזרחיים בטעם של מסורת")}
          subtitle={t("hero.subhead", "בקלאווה, כנאפה ומתוקים באיכות מובחרת")}
          cta={t("hero.orderNow", "לתפריט")}
          onCta={scrollToMenu}
        />
      </section>
    );
  }

  return (
    <section className="haat-container mt-3 md:mt-6">
      <div className="relative overflow-hidden rounded-2xl bg-ds-primary text-ds-text-on-primary shadow-[0_12px_32px_-16px_rgba(16,14,12,0.25)]">
        {/* Background image, cover+focus */}
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={settings?.storeName ?? BRAND.name}
            fill
            unoptimized={imageSrc.includes("firebasestorage")}
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Readability gradient — darker at bottom, lighter at top. RTL-safe. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/5" />
        </div>

        {/* Content card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex min-h-[240px] max-w-full flex-col justify-end px-5 py-6 sm:px-8 sm:py-10 md:min-h-[380px] md:max-w-[62%] md:justify-center md:px-12 md:py-14 lg:min-h-[440px] lg:px-16"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 md:text-xs">
            {t("hero.badge", "Welcome")}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl md:mt-3 md:text-4xl lg:text-5xl">
            {settings?.storeName ?? BRAND.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90 md:mt-3 md:text-base">
            {t("brand.taglineAlt", "")}
            {t("brand.tagline") && t("brand.taglineAlt") ? (
              <span className="mx-2 text-white/50">·</span>
            ) : null}
            {t("brand.tagline", "")}
          </p>
          <div className="mt-5 md:mt-7">
            <Button
              size="lg"
              className="h-11 rounded-full bg-white px-6 text-sm font-semibold text-ds-text shadow-md hover:bg-white/90 md:h-12 md:px-7 md:text-base"
              onClick={scrollToMenu}
            >
              {t("hero.orderNow", "Shop now")}
              <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" strokeWidth={2} />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
