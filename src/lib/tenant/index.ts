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
export { ALHALBY_PRESET, ALHALBY_PALETTE } from "./alhalby-preset";
export { mergeTenantConfig } from "./merge";
export {
  paletteToCssVars,
  applyTenantCssVars,
  tenantBootstrapCss,
} from "./css-vars";

import { ALHALBY_PRESET } from "./alhalby-preset";

/** The only storefront identity. Older tenant presets are not part of this project. */
export function resolveFallbackPreset(): typeof ALHALBY_PRESET {
  return ALHALBY_PRESET;
}
