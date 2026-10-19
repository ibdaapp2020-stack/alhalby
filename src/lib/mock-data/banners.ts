/**
 * Mock banners — a single generic hero banner used by the demo provider.
 */
import type { BannerSlide } from "@/types";

export const mockBanners: BannerSlide[] = [
  {
    id: "banner-welcome",
    title: "Welcome",
    subtitle: "Browse the demo menu",
    title_he: "ברוכים הבאים",
    title_ar: "أهلًا وسهلًا",
    title_en: "Welcome",
    subtitle_he: "זהו תפריט הדגמה — התאימו אותו דרך לוח הניהול",
    subtitle_ar: "هذه قائمة تجريبية — خصّصها من لوحة التحكم",
    subtitle_en: "This is a demo menu — customize it from the admin panel",
    button_he: "לתפריט",
    button_ar: "إلى القائمة",
    button_en: "View menu",
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
