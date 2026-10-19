/**
 * Mock settings — neutral defaults used by the demo provider when no
 * backend is wired. The admin "Settings" page edits a copy of this
 * object stored in `localStorage`.
 */
import type { AppSettings } from "@/services/settingsService";
import { resolveFallbackPreset } from "@/lib/tenant";

const preset = resolveFallbackPreset();

export const mockSettings: AppSettings = {
  storeName: preset.brand.name,
  logoUrl: preset.brand.logoUrl,
  storeImageUrl: preset.brand.storeImageUrl,
  showProductThumbnails: true,
  phone: "",
  address: "",
  hours: preset.hours.summary,
  currency: preset.currency,
  theme: {
    primary: preset.palette.primary,
    accent: preset.palette.accent,
    background: preset.palette.bg,
  },
  seo: {
    title: preset.brand.name,
    description: preset.brand.tagline || preset.seo.description,
  },
  social: { instagram: "", facebook: "", whatsapp: "" },
  mapsUrl: "",
  faviconUrl: preset.brand.faviconUrl ?? preset.brand.logoUrl,
};
