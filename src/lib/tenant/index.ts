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
 * During the migration we keep Mishkat as the fallback to preserve the live
 * deployment. New tenants should populate Firestore `settings/app` and the
 * UI will seamlessly flip to their values.
 *
 * To ship this BASE as a true-blank starter (no residual Mishkat branding),
 * set `NEXT_PUBLIC_TENANT_PRESET=base` in the environment.
 */
export function resolveFallbackPreset(): typeof BASE_TENANT_DEFAULTS {
  const presetId =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_TENANT_PRESET) ||
    "mishkat";
  if (presetId === "base") return BASE_TENANT_DEFAULTS;
  return MISHKAT_PRESET;
}
