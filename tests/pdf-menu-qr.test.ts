import { describe, expect, it } from "vitest";
import {
  getPublicOrderUrl,
  getPublicSiteUrl,
  isPublicCustomerUrl,
  PRODUCTION_SITE_URL,
  resolveQrTargetUrl,
} from "@/lib/site-url";

describe("public site URL", () => {
  it("defaults to the configured public site", () => {
    expect(getPublicSiteUrl()).toBe(PRODUCTION_SITE_URL);
    expect(getPublicOrderUrl()).toBe(`${PRODUCTION_SITE_URL}/`);
  });

  it("rejects localhost, LAN IPs, and Vercel preview hosts", () => {
    expect(isPublicCustomerUrl("http://localhost:3000")).toBe(false);
    expect(isPublicCustomerUrl("http://127.0.0.1:3000")).toBe(false);
    expect(isPublicCustomerUrl("http://192.168.1.20:3000")).toBe(false);
    expect(isPublicCustomerUrl("https://preview-git-feat-xyz.vercel.app")).toBe(false);
    expect(isPublicCustomerUrl("https://example.com/")).toBe(true);
  });

  it("encodes the production homepage even when given a local origin", () => {
    expect(resolveQrTargetUrl("http://localhost:3000")).toBe(`${PRODUCTION_SITE_URL}/`);
    expect(resolveQrTargetUrl("http://127.0.0.1:3000/admin/menu-builder")).toBe(`${PRODUCTION_SITE_URL}/`);
    expect(resolveQrTargetUrl("https://project-abc-git-branch.vercel.app")).toBe(`${PRODUCTION_SITE_URL}/`);
    expect(resolveQrTargetUrl("not a url")).toBe(`${PRODUCTION_SITE_URL}/`);
    expect(resolveQrTargetUrl("https://example.com/")).toBe("https://example.com/");
  });
});
