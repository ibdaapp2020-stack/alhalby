import type { TenantConfig, TenantPalette } from "./types";

/**
 * Map a TenantPalette to the CSS custom-property pairs consumed by the design
 * system. These are read by Tailwind v4 `@theme` tokens defined in globals.css
 * and by raw CSS variable references throughout the app.
 *
 * Keep the key names stable — they are referenced by:
 *  - src/app/globals.css (@theme block)
 *  - src/components/providers/tenant-provider.tsx (runtime apply)
 *  - any component using `var(--ds-*)` directly
 */
export function paletteToCssVars(palette: TenantPalette): Record<string, string> {
  return {
    "--ds-bg": palette.bg,
    "--ds-bg-elevated": palette.bgElevated,
    "--ds-surface": palette.surface,
    "--ds-surface-muted": palette.surfaceMuted,
    "--ds-border": palette.border,
    "--ds-border-strong": palette.borderStrong,
    "--ds-text": palette.text,
    "--ds-text-muted": palette.textMuted,
    "--ds-text-on-primary": palette.textOnPrimary,
    "--ds-primary": palette.primary,
    "--ds-primary-hover": palette.primaryHover,
    "--ds-secondary": palette.secondary,
    "--ds-accent": palette.accent,
    "--ds-success": palette.success,
    "--ds-warning": palette.warning,
    "--ds-danger": palette.danger,
  };
}

export function applyTenantCssVars(
  element: HTMLElement,
  config: Pick<TenantConfig, "palette" | "typography">
): void {
  const vars = paletteToCssVars(config.palette);
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
  element.style.setProperty("--ds-font-he", config.typography.heFont);
  element.style.setProperty("--ds-font-ar", config.typography.arFont);
  element.style.setProperty("--ds-font-en", config.typography.enFont);
  element.style.setProperty(
    "--ds-base-size",
    `${config.typography.baseSizeRem}rem`
  );
}

/**
 * Build the inline <style> content used for the no-flash tenant bootstrap
 * injected into the server-rendered HTML head. This runs before React hydrates
 * so the first paint already uses the correct brand palette.
 */
export function tenantBootstrapCss(config: TenantConfig): string {
  const vars = paletteToCssVars(config.palette);
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");
  return `:root{${body} --ds-font-he:${config.typography.heFont}; --ds-font-ar:${config.typography.arFont}; --ds-font-en:${config.typography.enFont};}`;
}
