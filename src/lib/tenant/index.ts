export type {
  TenantConfig,
  TenantConfigPatch,
  TenantBrand,
  TenantPalette,
  TenantPaletteKey,
  TenantTypography,
  TenantContact,
  TenantHours,
  TenantOrdering,
  TenantPayments,
  TenantFeatures,
  DeepPartial,
} from "./types";

export { BASE_PALETTE, BASE_TENANT_DEFAULTS } from "./defaults";
export { MISHKAT_PRESET } from "./mishkat-preset";
export { mergeTenantConfig } from "./merge";
export {
  paletteToCssVars,
  applyTenantCssVars,
  tenantBootstrapCss,
} from "./css-vars";

import { BASE_TENANT_DEFAULTS } from "./defaults";
import { MISHKAT_PRESET } from "./mishkat-preset";

/**
 * The baseline config used by the TenantProvider when Firestore returns no
 * `settings/app` document and the environment hasn't selected a named preset.
 *
 * The default is the neutral BASE preset so a fresh clone of this template
 * never leaks branding from a previous tenant. Set `NEXT_PUBLIC_TENANT_PRESET`
 * to `mishkat` (or any other registered preset) to boot with those defaults
 * instead — useful when continuing an existing deployment.
 */
export function resolveFallbackPreset(): typeof BASE_TENANT_DEFAULTS {
  const presetId =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_TENANT_PRESET) ||
    "base";
  if (presetId === "mishkat") return MISHKAT_PRESET;
  return BASE_TENANT_DEFAULTS;
}
