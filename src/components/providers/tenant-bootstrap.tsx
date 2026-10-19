import { resolveFallbackPreset, tenantBootstrapCss } from "@/lib/tenant";

/**
 * Server component that emits the initial tenant CSS variables inline in the
 * HTML head. This runs before React hydrates so the first paint already uses
 * the correct palette — eliminating the "flash of wrong brand" on cold loads.
 *
 * Once the TenantProvider mounts on the client, it subscribes to Firestore
 * `settings/app` and overwrites these values with the tenant's live overrides.
 */
export function TenantBootstrap() {
  const preset = resolveFallbackPreset();
  const css = tenantBootstrapCss(preset);
  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      id="tenant-bootstrap-vars"
    />
  );
}
