/**
 * Mock banners — a single generic hero banner used by the demo provider.
 */
import type { BannerSlide } from "@/types";

export const mockBanners: BannerSlide[] = [
  {
    id: "banner-welcome",
    title: "ממתקי אלחלבי",
    subtitle: "ממתקים מזרחיים בטעם של מסורת",
    title_he: "ממתקי אלחלבי",
    title_ar: "حلويات الحلبي",
    title_en: "Alhalby Sweets",
    subtitle_he: "ממתקים מזרחיים בטעם של מסורת",
    subtitle_ar: "حلويات شرقية بطعم التراث",
    subtitle_en: "Eastern sweets with the taste of tradition",
    button_he: "לתפריט",
    button_ar: "إلى القائمة",
    button_en: "View the menu",
    image: "/brand/store-hero.svg",
    mobileImage: "/brand/store-hero.svg",
    cta: "View menu",
    ctaUrl: "#menu",
    ctaAction: "link",
    desktopPositionX: 50,
    desktopPositionY: 50,
    mobilePositionX: 50,
    mobilePositionY: 50,
    desktopZoom: 1,
    mobileZoom: 1,
    active: true,
    sortOrder: 1,
  },
];
