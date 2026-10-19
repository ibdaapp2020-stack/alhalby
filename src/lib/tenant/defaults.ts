/**
 * BASE tenant defaults — the restaurant-ordering foundation.
 *
 * Palette, typography, and feature flags here define the look & behaviour of a
 * freshly-cloned BASE install, before any tenant customization. They match the
 * spec's "Modern Restaurant Ordering" direction: warm paper background, red
 * primary, charcoal secondary, generous surfaces.
 */

import type { TenantConfig, TenantPalette } from "./types";

export const BASE_PALETTE: TenantPalette = {
  // Surfaces
  bg: "#FAF8F5",
  bgElevated: "#F5F0E8",
  surface: "#FFFFFF",
  surfaceMuted: "#F2EDE6",
  // Lines
  border: "#EBE5DE",
  borderStrong: "#D9D1C7",
  // Text
  text: "#201D1A",
  textMuted: "#5B544C",
  textOnPrimary: "#FFFFFF",
  // Brand
  primary: "#C12C22",
  primaryHover: "#A5241B",
  secondary: "#171717",
  accent: "#C27B42",
  // Semantic
  success: "#16845B",
  warning: "#B88717",
  danger: "#D64242",
};

export const BASE_TENANT_DEFAULTS: TenantConfig = {
  id: "base",
  brand: {
    name: "Restaurant",
    nameShort: "Restaurant",
    tagline: "Freshly prepared, ordered online",
    logoUrl: "/logo-transparent.png",
    faviconUrl: "/logo-transparent.png",
    storeImageUrl: "/meskahphoto.png",
  },
  palette: BASE_PALETTE,
  typography: {
    heFont: "Heebo",
    arFont: "Cairo",
    enFont: "Inter",
    baseSizeRem: 1,
  },
  contact: {
    phone: "",
    address: "",
    mapsUrl: "",
    whatsapp: "",
    instagram: "",
    facebook: "",
  },
  hours: {
    summary: "Sun–Thu 11:00–22:00",
  },
  ordering: {
    enabled: true,
    pickupEnabled: true,
    deliveryEnabled: false,
    minOrderTotal: 0,
    deliveryFee: 0,
    prepTimeMinutes: 20,
    requirePhone: true,
    accountsEnabled: false,
  },
  payments: {
    cash: true,
    cardOnPickup: false,
    cardOnline: false,
  },
  features: {
    banners: false,
    qrLinks: true,
    pdfMenuBuilder: false,
    aiAssistant: false,
    businessRules: false,
    mediaLibrary: true,
    menuDisplay: true,
  },
  currency: "ILS",
  seo: {
    title: "Restaurant",
    description: "Order online for pickup or delivery",
  },
};
