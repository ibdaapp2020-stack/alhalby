import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Layers,
  ClipboardList,
  Users,
  ImageIcon,
  Settings,
  Ticket,
} from "lucide-react";
import { adminPath, toInternalAdminPath } from "@/lib/domains/host-routing";
import type { AdminSurface } from "@/lib/domains/host-routing";

export type AdminNavSegment = Parameters<typeof adminPath>[0];

export type AdminNavItem = {
  segment: AdminNavSegment;
  labelKey: string;
  icon: LucideIcon;
  exact?: boolean;
  adminOnly?: boolean;
};

export type AdminNavGroup = {
  labelKey: string;
  items: AdminNavItem[];
};

/**
 * IBDA Store Base — simplified admin navigation.
 *
 * The nine spec-mandated entries, grouped only loosely so the dark sidebar
 * stays readable. Hidden technical pages (product-builder, business-rules,
 * menu-builder, qr, media, assistant, printer, printer-test, users,
 * ai-assistant) still exist under /admin/* for deep links and advanced
 * tooling, but they're intentionally not surfaced here to keep the admin
 * focused on day-to-day storefront operation.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    labelKey: "admin.nav.group.overview",
    items: [
      { segment: "", labelKey: "admin.dashboard", icon: LayoutDashboard, exact: true },
      { segment: "orders", labelKey: "admin.orders", icon: ClipboardList },
    ],
  },
  {
    labelKey: "admin.nav.group.catalog",
    items: [
      { segment: "products", labelKey: "admin.products", icon: Package },
      { segment: "categories", labelKey: "admin.categories", icon: Tags },
      { segment: "modifier-groups", labelKey: "admin.modifierManagement", icon: Layers },
    ],
  },
  {
    labelKey: "admin.nav.group.audience",
    items: [
      { segment: "customers", labelKey: "admin.customers", icon: Users },
      { segment: "coupons", labelKey: "admin.coupons", icon: Ticket },
    ],
  },
  {
    labelKey: "admin.nav.group.store",
    items: [
      { segment: "banners", labelKey: "admin.bannersDesign", icon: ImageIcon },
      { segment: "settings", labelKey: "admin.settings", icon: Settings },
    ],
  },
];

export function getAdminNavHref(segment: AdminNavSegment, surface: AdminSurface): string {
  return adminPath(segment, surface);
}

export function getAdminNavInternalPath(segment: AdminNavSegment): string {
  return adminPath(segment, "dev");
}

/** Map pathname → page title translation key */
export const ADMIN_PAGE_TITLES: Record<string, string> = {
  "/admin": "admin.dashboard",
  "/admin/products": "admin.products",
  "/admin/categories": "admin.categories",
  "/admin/modifier-groups": "admin.modifiers.title",
  "/admin/product-builder": "admin.productAssignments",
  "/admin/business-rules": "admin.selectionRules",
  "/admin/orders": "admin.orders.title",
  "/admin/customers": "admin.customers.title",
  "/admin/coupons": "admin.coupons",
  "/admin/banners": "admin.bannersDesign",
  "/admin/menu-builder": "admin.menuBuilder",
  "/admin/qr": "admin.qr.title",
  "/admin/media": "admin.media.title",
  "/admin/assistant": "admin.assistant.title",
  "/admin/printer": "admin.printer.title",
  "/admin/printer-test": "admin.printerTest.title",
  "/admin/users": "admin.users.title",
  "/admin/settings": "admin.settings.title",
};

export function getAdminPageTitleKey(pathname: string): string {
  const internal = toInternalAdminPath(pathname);
  if (ADMIN_PAGE_TITLES[internal]) return ADMIN_PAGE_TITLES[internal];
  const match = Object.keys(ADMIN_PAGE_TITLES)
    .filter((k) => k !== "/admin")
    .find((k) => internal.startsWith(k));
  return match ? ADMIN_PAGE_TITLES[match] : "admin.dashboard";
}
