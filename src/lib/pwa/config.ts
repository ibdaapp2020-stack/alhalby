/**
 * PWA constants — installable app shell only; no business logic.
 *
 * Names and colors fall back to the active tenant preset so a fresh clone of
 * this template never ships with a previous tenant's identity. Admin → Settings
 * writes to Firestore `settings/app` which the TenantProvider merges live.
 */

import { resolveFallbackPreset } from "@/lib/tenant";

const preset = resolveFallbackPreset();

export const PWA_APP_NAME = preset.brand.name;

export const PWA_SHORT_NAME = preset.brand.nameShort ?? preset.brand.name;

export const PWA_DESCRIPTION =
  preset.brand.tagline ||
  "בקלאווה, כנאפה ומתוקים באיכות מובחרת";

/** Customer menu home — same as storefront catalog */
export const PWA_START_URL = "/";

export const PWA_SCOPE = "/";

export const PWA_THEME_COLOR = preset.palette.bg;

export const PWA_BACKGROUND_COLOR = preset.palette.bg;

/** Bump when service worker caching strategy or precache list changes. */
export const PWA_SW_VERSION = "store-pwa-3";

export const PWA_ICONS = {
  icon192: "/icons/icon-192.png",
  icon512: "/icons/icon-512.png",
  maskable512: "/icons/icon-maskable-512.png",
  appleTouch: "/icons/apple-touch-icon.png",
} as const;
