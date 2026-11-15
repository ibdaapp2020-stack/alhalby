import { describe, expect, it } from "vitest";
import {
  adminPath,
  isMenuHost,
  isOrderingPath,
  canonicalAdminPathname,
  hasDedicatedPortalHost,
  isPortalHost,
  isViewOnlyMenuSurface,
  shouldBlockAdminOnHost,
  shouldHideCustomerChrome,
  toInternalAdminPath,
  toPortalPath,
} from "@/lib/domains/host-routing";
import { filterMenuDisplayProducts } from "@/lib/menu/category-tree";
import type { Category, Product } from "@/types";

describe("host-routing", () => {
  it("detects portal host", () => {
    expect(isPortalHost("portal.example.com")).toBe(true);
    expect(isPortalHost("example.com")).toBe(false);
    expect(isPortalHost("localhost:3000")).toBe(false);
  });

  it("detects menu host", () => {
    expect(isMenuHost("menu.example.com")).toBe(true);
    expect(isMenuHost("example.com")).toBe(false);
    expect(isMenuHost("portal.example.com")).toBe(false);
  });

  it("keeps /admin on the store when no portal host is configured", () => {
    expect(hasDedicatedPortalHost()).toBe(false);
    expect(shouldBlockAdminOnHost("example.com")).toBe(false);
    expect(shouldBlockAdminOnHost("alhalby.vercel.app")).toBe(false);
    expect(shouldBlockAdminOnHost("menu.example.com")).toBe(true);
    expect(shouldBlockAdminOnHost("portal.example.com")).toBe(false);
    expect(shouldBlockAdminOnHost("localhost:3000")).toBe(false);
  });

  it("folds /ADMIN onto the /admin route", () => {
    expect(canonicalAdminPathname("/ADMIN")).toBe("/admin");
    expect(canonicalAdminPathname("/Admin/Login")).toBe("/admin/login");
    expect(canonicalAdminPathname("/admin")).toBeNull();
    expect(canonicalAdminPathname("/admin/login")).toBeNull();
    expect(canonicalAdminPathname("/")).toBeNull();
  });

  it("maps portal paths to internal admin routes", () => {
    expect(toInternalAdminPath("/")).toBe("/admin");
    expect(toInternalAdminPath("/login")).toBe("/admin/login");
    expect(toInternalAdminPath("/products")).toBe("/admin/products");
    expect(toInternalAdminPath("/admin/orders")).toBe("/admin/orders");
  });

  it("maps internal admin routes to clean portal paths", () => {
    expect(toPortalPath("/admin")).toBe("/");
    expect(toPortalPath("/admin/login")).toBe("/login");
    expect(toPortalPath("/admin/products")).toBe("/products");
  });

  it("builds surface-aware admin hrefs", () => {
    expect(adminPath("products", "portal")).toBe("/products");
    expect(adminPath("products", "dev")).toBe("/admin/products");
    expect(adminPath("login", "portal")).toBe("/login");
    expect(adminPath("", "portal")).toBe("/");
  });

  it("hides customer chrome on portal, menu, and /admin", () => {
    expect(shouldHideCustomerChrome("/products", "portal.example.com")).toBe(true);
    expect(shouldHideCustomerChrome("/", "menu.example.com")).toBe(true);
    expect(shouldHideCustomerChrome("/menu-display", "localhost")).toBe(true);
    expect(shouldHideCustomerChrome("/catalog", "example.com")).toBe(false);
    expect(shouldHideCustomerChrome("/admin/products", "localhost")).toBe(true);
  });

  it("flags ordering paths and view-only surface", () => {
    expect(isOrderingPath("/checkout")).toBe(true);
    expect(isOrderingPath("/cart")).toBe(true);
    expect(isOrderingPath("/orders")).toBe(true);
    expect(isViewOnlyMenuSurface("menu.example.com")).toBe(true);
    expect(isViewOnlyMenuSurface("localhost", "/menu-display")).toBe(true);
    expect(isViewOnlyMenuSurface("example.com", "/")).toBe(false);
  });
});

describe("menu display product filter", () => {
  it("includes subcategory products under a root category", () => {
    const categories = [
      { id: "coffee", parentId: null, active: true, sortOrder: 1 },
      { id: "hot", parentId: "coffee", active: true, sortOrder: 1 },
    ] as Category[];
    const products = [
      {
        id: "1",
        categoryId: "coffee",
        subcategoryId: "hot",
        active: true,
        sortOrder: 1,
        isPopular: false,
      },
      {
        id: "2",
        categoryId: "desserts",
        active: true,
        sortOrder: 1,
        isPopular: false,
      },
    ] as Product[];

    const all = filterMenuDisplayProducts(products, null, categories);
    expect(all.map((p) => p.id)).toEqual(["1", "2"]);

    const coffee = filterMenuDisplayProducts(products, "coffee", categories);
    expect(coffee.map((p) => p.id)).toEqual(["1"]);
  });
});
