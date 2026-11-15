/**
 * Legacy brand constants — kept only as a thin bridge for existing imports.
 *
 * ⚠️ Do NOT reference these in new code. The source of truth is `useTenant()`
 * (client) or `resolveFallbackPreset()` (server). This file resolves to the
 * active tenant preset so legacy consumers keep working without re-wiring.
 *
 * To change store name, logo, tagline, or image, update the Firestore
 * `settings/app` document (or Admin → Settings) — no code change required.
 */

import { resolveFallbackPreset } from "@/lib/tenant";

const preset = resolveFallbackPreset();

/** Official names. Arabic is the default storefront language. */
export const BRAND_NAMES = {
  he: "ממתקי אלחלבי",
  ar: "حلويات الحلبي",
  en: "Al Halabi Sweets",
} as const;

const KNOWN_BRAND_NAMES = new Set<string>([
  ...Object.values(BRAND_NAMES),
  "My Store",
  "Store",
  "MISHKAT CAFÉ",
  "MISHKAH CAFE",
  "MISHKAH CAFÉ",
]);

/** Locale name, unless the admin saved a custom store name. */
export function displayStoreName(
  locale: "he" | "ar" | "en",
  settingsName?: string | null
): string {
  const custom = settingsName?.trim() ?? "";
  if (!custom || KNOWN_BRAND_NAMES.has(custom)) return BRAND_NAMES[locale];
  return custom;
}

export const BRAND = {
  /** Display logo — resolves from tenant preset. */
  logo: preset.brand.logoUrl,
  /** Alias kept for backward compatibility with legacy imports. */
  logoOriginal: preset.brand.logoUrl,
  /** Width / height of public/logo.png (333×585). */
  logoAspect: 333 / 585,
  store: preset.brand.storeImageUrl,
  /** Local fallback when remote store image fails to load. */
  storeFallback: preset.brand.storeImageUrl,
  name: preset.brand.name,
  nameShort: preset.brand.nameShort ?? preset.brand.name,
  tagline: preset.brand.tagline,
  taglineAlt: preset.brand.tagline,
  welcome: "Welcome to",
} as const;

/** Legacy color aliases — new code should read `useTenant().palette`. */
export const BRAND_COLORS = {
  primary: preset.palette.primary,
  primaryLight: preset.palette.primaryHover,
  secondary: preset.palette.secondary,
  accent: preset.palette.accent,
  accentLight: preset.palette.accent,
  cream: preset.palette.bg,
  warmWhite: preset.palette.surface,
} as const;

/** Tiny blur placeholders for Next/Image — generic 1×1 transparent PNG. */
export const BLUR = {
  logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  store: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
} as const;

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Logo display heights — mobile 38–48px, desktop 48–64px. */
export const LOGO_HEIGHT: Record<LogoSize, number> = {
  xs: 32,
  sm: 40,
  md: 48,
  lg: 56,
  xl: 64,
};

/** Resolve hero/store image: Firestore settings URL → tenant preset default. */
export function getStoreImageSrc(settingsUrl?: string | null): string {
  if (settingsUrl?.trim()) return settingsUrl.trim();
  return BRAND.store;
}

/** Resolve logo: Firestore settings URL → tenant preset default. */
export function getLogoSrc(settingsUrl?: string | null): string {
  if (settingsUrl?.trim()) return settingsUrl.trim();
  return BRAND.logo;
}
