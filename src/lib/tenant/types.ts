/**
 * Tenant configuration — the shape of a single restaurant's identity, theme,
 * and feature set. Every surface in the app reads from a resolved TenantConfig
 * instead of hard-coded constants.
 *
 * The BASE ships with safe defaults ({@link BASE_TENANT_DEFAULTS}). A tenant
 * overrides any subset of these via Firestore `settings/app`. This project
 * boots from the Al Halabi preset.
 */

export type TenantPaletteKey =
  | "bg"
  | "bgElevated"
  | "surface"
  | "surfaceMuted"
  | "border"
  | "borderStrong"
  | "text"
  | "textMuted"
  | "textOnPrimary"
  | "primary"
  | "primaryHover"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type TenantPalette = Record<TenantPaletteKey, string>;

export interface TenantTypography {
  /** Google Fonts family used for Latin + Hebrew body text */
  heFont: string;
  /** Google Fonts family used for Arabic body text */
  arFont: string;
  /** Google Fonts family used for Latin body text */
  enFont: string;
  /** Base text size in rem for the mobile layout */
  baseSizeRem: number;
}

export interface TenantBrand {
  /** Display name shown in header, titles, PWA, emails */
  name: string;
  /** Optional short name for tight UI (bottom nav title, etc) */
  nameShort?: string;
  /** Short tagline (hero subheading) */
  tagline: string;
  /** Public logo URL (absolute or app-relative). Transparent PNG preferred. */
  logoUrl: string;
  /** Favicon URL — defaults to logoUrl */
  faviconUrl?: string;
  /** Full-bleed hero/store image */
  storeImageUrl: string;
}

export interface TenantContact {
  phone: string;
  address: string;
  mapsUrl?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
}

export interface TenantHours {
  /** Simple free-text hours (fallback / display only) */
  summary: string;
  /** Optional structured schedule — day index (0=Sun) → "HH:MM-HH:MM" or null if closed */
  weekly?: Record<number, { open: string; close: string } | null>;
}

export interface TenantOrdering {
  /** Store accepts orders at all */
  enabled: boolean;
  /** Customer can pick up at the store */
  pickupEnabled: boolean;
  /** Store ships to customer address */
  deliveryEnabled: boolean;
  /** Minimum order total (in minor currency) to allow checkout */
  minOrderTotal: number;
  /** Delivery fee (shown only when deliveryEnabled) */
  deliveryFee: number;
  /** Estimated prep time in minutes (shown on success screen) */
  prepTimeMinutes: number;
  /** Require phone number at checkout */
  requirePhone: boolean;
  /** Whether to show customer account UI (/account route) */
  accountsEnabled: boolean;
}

export interface TenantPayments {
  /** Accept cash on pickup/delivery. Default: true. */
  cash: boolean;
  /** Accept card at store (manual terminal). Default: false. */
  cardOnPickup: boolean;
  /** Accept online card payments via integrated gateway. Default: false. */
  cardOnline: boolean;
}

/**
 * Feature flags controlling optional admin surfaces. All default to false so
 * fresh tenants start with a lean restaurant admin. Mishkat preset enables
 * banners + QR + business-rules + PDF menu builder to preserve current UX.
 */
export interface TenantFeatures {
  banners: boolean;
  qrLinks: boolean;
  pdfMenuBuilder: boolean;
  aiAssistant: boolean;
  businessRules: boolean;
  mediaLibrary: boolean;
  /** Expose public /menu-display (read-only menu) route */
  menuDisplay: boolean;
}

export interface TenantConfig {
  /** Stable tenant identifier. Used by multi-tenant deployments. */
  id: string;
  brand: TenantBrand;
  palette: TenantPalette;
  typography: TenantTypography;
  contact: TenantContact;
  hours: TenantHours;
  ordering: TenantOrdering;
  payments: TenantPayments;
  features: TenantFeatures;
  currency: "ILS" | "USD" | "EUR";
  /** SEO metadata */
  seo: { title: string; description: string };
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type TenantConfigPatch = DeepPartial<TenantConfig>;
