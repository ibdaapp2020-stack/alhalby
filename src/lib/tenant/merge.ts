import type { TenantConfig, TenantConfigPatch } from "./types";

/**
 * Deep-merge a partial tenant patch over a baseline tenant config.
 *
 * Rules:
 *  - Scalar values in the patch replace baseline values.
 *  - Nested objects (brand, palette, typography, etc.) are merged key-by-key.
 *  - Arrays, if ever added to TenantConfig, are replaced (not concatenated).
 */
export function mergeTenantConfig(
  base: TenantConfig,
  patch: TenantConfigPatch | null | undefined
): TenantConfig {
  if (!patch) return base;

  const next: TenantConfig = {
    ...base,
    brand: { ...base.brand, ...patch.brand },
    palette: { ...base.palette, ...patch.palette },
    typography: { ...base.typography, ...patch.typography },
    contact: { ...base.contact, ...patch.contact },
    hours: {
      ...base.hours,
      ...patch.hours,
      weekly: patch.hours?.weekly ?? base.hours.weekly,
    },
    ordering: { ...base.ordering, ...patch.ordering },
    payments: { ...base.payments, ...patch.payments },
    features: { ...base.features, ...patch.features },
    seo: { ...base.seo, ...patch.seo },
  };

  if (patch.id) next.id = patch.id;
  if (patch.currency) next.currency = patch.currency;

  return next;
}
