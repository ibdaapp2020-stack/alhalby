/**
 * Mishkat Café preset — the pre-redesign brand values, kept intact so the
 * current customer-facing deployment keeps rendering identically until the
 * tenant's Firestore `settings/app` document is populated.
 *
 * This file is the ONLY place in the BASE where "Mishkat"-specific defaults
 * live in code. Everything downstream reads from a resolved TenantConfig.
 */

import type { TenantConfig } from "./types";
import { BASE_TENANT_DEFAULTS } from "./defaults";

/** Legacy palette sampled from the original Mishkat Café globals.css */
const MISHKAT_PALETTE = {
  bg: "#F8F3ED",
  bgElevated: "#FFFEFB",
  surface: "#FFFEFB",
  surfaceMuted: "#EDE4D8",
  border: "#D4C4B0",
  borderStrong: "#B9A788",
  text: "#3D2B24",
  textMuted: "#5A4038",
  textOnPrimary: "#FFFEFB",
  primary: "#3D2B24",
  primaryHover: "#5a4038",
  secondary: "#007A80",
  accent: "#D4A76A",
  success: "#16845B",
  warning: "#B88717",
  danger: "#D64242",
} as const;

export const MISHKAT_PRESET: TenantConfig = {
  ...BASE_TENANT_DEFAULTS,
  id: "mishkat",
  brand: {
    name: "MISHKAT CAFÉ",
    nameShort: "Mishkat",
    tagline: "Where Light Meets Coffee",
    logoUrl: "/logo-transparent.png",
    faviconUrl: "/logo-transparent.png",
    storeImageUrl: "/meskahphoto.png",
  },
  palette: MISHKAT_PALETTE,
  typography: {
    heFont: "Heebo",
    arFont: "Cairo",
    enFont: "Inter",
    baseSizeRem: 1,
  },
  features: {
    banners: true,
    qrLinks: true,
    pdfMenuBuilder: true,
    aiAssistant: true,
    businessRules: true,
    mediaLibrary: true,
    menuDisplay: true,
  },
  seo: {
    title: "MISHKAT CAFÉ",
    description: "Coffee • Crêpes • Desserts — Where Light Meets Coffee",
  },
};
