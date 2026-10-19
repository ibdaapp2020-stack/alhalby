/**
 * Fallback public URL used when `NEXT_PUBLIC_SITE_URL` is missing or invalid.
 * Set `NEXT_PUBLIC_SITE_URL` in your deployment env to your live storefront
 * origin so QR codes, emails, and OG links point at the right domain.
 */
export const PRODUCTION_SITE_URL =
  process.env.NEXT_PUBLIC_PRODUCTION_FALLBACK_URL?.trim() || "https://example.com";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function isPrivateOrLocalHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "0.0.0.0") {
    return true;
  }
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (host.endsWith(".local")) return true;
  return false;
}

function isVercelPreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  // The production Vercel deployment hostname can be whitelisted via env so
  // it isn't treated as a throwaway preview. All other *.vercel.app hosts
  // are considered previews.
  const prodHost = process.env.NEXT_PUBLIC_VERCEL_PROD_HOST?.trim().toLowerCase();
  if (prodHost && host === prodHost) return false;
  return host.endsWith(".vercel.app");
}

export function isPublicCustomerUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (isPrivateOrLocalHost(parsed.hostname)) return false;
    if (isVercelPreviewHost(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function readConfiguredSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  if (!raw) return "";
  try {
    const parsed = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}

/** Canonical public storefront origin. Never localhost, LAN IP, or Vercel preview. */
export function getPublicSiteUrl(): string {
  const configured = readConfiguredSiteUrl();
  if (configured && isPublicCustomerUrl(configured)) {
    return stripTrailingSlash(configured);
  }
  return PRODUCTION_SITE_URL;
}

/** Customer order page — the live catalog homepage. */
export function getPublicOrderUrl(): string {
  return `${getPublicSiteUrl()}/`;
}

/** Any candidate (including localhost) is replaced with the public order URL when invalid. */
export function resolveQrTargetUrl(candidate?: string | null): string {
  const fallback = getPublicOrderUrl();
  const raw = candidate?.trim();
  if (!raw) return fallback;
  try {
    const parsed = new URL(raw);
    if (!isPublicCustomerUrl(parsed.href)) return fallback;
    if (parsed.pathname === "/" || parsed.pathname === "") {
      return `${stripTrailingSlash(`${parsed.protocol}//${parsed.host}`)}/`;
    }
    return parsed.href;
  } catch {
    return fallback;
  }
}
