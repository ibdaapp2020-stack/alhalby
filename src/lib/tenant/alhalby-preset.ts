/**
 * ממתקי אלחלבי — default brand for this deployment.
 * Palette and logo are the source of truth until Admin → Settings overrides them.
 */

import type { TenantConfig, TenantPalette } from "./types";
import { BASE_TENANT_DEFAULTS } from "./defaults";

export const ALHALBY_PALETTE: TenantPalette = {
  bg: "#F8F3EA",
  bgElevated: "#EFE4D1",
  surface: "#FFFCF7",
  surfaceMuted: "#F3EBDD",
  border: "#E6D7C3",
  borderStrong: "#C9A35D",
  text: "#3E2A1F",
  textMuted: "#6B5346",
  textOnPrimary: "#F8F3EA",
  primary: "#6E2132",
  primaryHover: "#541826",
  secondary: "#3E2A1F",
  accent: "#C9A35D",
  success: "#5E7A45",
  warning: "#A67C2D",
  danger: "#9C3040",
};

export const ALHALBY_PRESET: TenantConfig = {
  ...BASE_TENANT_DEFAULTS,
  id: "alhalby",
  brand: {
    name: "حلويات الحلبي",
    nameShort: "الحلبي",
    tagline: "حلويات شرقية بطعم التراث",
    logoUrl: "/logo.png",
    faviconUrl: "/logo.png",
    storeImageUrl: "",
  },
  palette: ALHALBY_PALETTE,
  typography: {
    heFont: "Heebo",
    arFont: "Cairo",
    enFont: "Inter",
    baseSizeRem: 1,
  },
  hours: {
    summary: "كل يوم 09:00–22:00",
  },
  features: {
    banners: true,
    qrLinks: true,
    pdfMenuBuilder: false,
    aiAssistant: false,
    businessRules: false,
    mediaLibrary: true,
    menuDisplay: true,
  },
  seo: {
    title: "حلويات الحلبي",
    description: "بقلاوة وكنافة وحلويات بجودة مختارة",
  },
};
