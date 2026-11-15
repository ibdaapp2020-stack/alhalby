"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, X, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { displayStoreName } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useT, useLocale } from "@/components/providers/locale-provider";
import { useAuth } from "@/components/providers/auth-provider";
import {
  ADMIN_NAV_GROUPS,
  getAdminNavHref,
  getAdminNavInternalPath,
  type AdminNavItem,
} from "./admin-nav-config";
import { ADMIN_LAYOUT, ADMIN_SIDEBAR_WIDTH_PX } from "./admin-layout-config";
import { toInternalAdminPath, publicStoreHref } from "@/lib/domains/host-routing";
import { useAdminPath, useAdminSurface } from "@/hooks/useAdminPath";
import { useSettings } from "@/hooks/useSettings";

/**
 * IBDA admin sidebar — Shawarma-Amir-inspired dark rail.
 *
 * On the storefront this is the only navigation chrome the operator sees:
 * a single dark column with grouped nav items, a current-store badge at
 * the top, and store-switch / logout controls pinned to the bottom.
 */
function NavRow({
  item,
  isActive,
  onNavigate,
}: {
  item: AdminNavItem & { href: string };
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const t = useT();
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      data-active={isActive ? "true" : "false"}
      aria-current={isActive ? "page" : undefined}
      className="admin-sidebar-link"
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span className="truncate">{t(item.labelKey)}</span>
    </Link>
  );
}

function NavSections({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT();
  const pathname = usePathname();
  const { user } = useAuth();
  const surface = useAdminSurface();
  const internalPathname = toInternalAdminPath(pathname);

  return (
    <nav className="space-y-5" aria-label={t("admin.subtitle")}>
      {ADMIN_NAV_GROUPS.map((group) => {
        const items = group.items.filter(
          (item) => !item.adminOnly || user?.role === "Admin"
        );
        if (!items.length) return null;
        return (
          <div key={group.labelKey}>
            <p className="admin-sidebar-section-label">{t(group.labelKey)}</p>
            <div className="space-y-1">
              {items.map((item) => {
                const href = getAdminNavHref(item.segment, surface);
                const itemPath = getAdminNavInternalPath(item.segment);
                const isActive = item.exact
                  ? internalPathname === itemPath
                  : internalPathname === itemPath ||
                    internalPathname.startsWith(`${itemPath}/`);
                return (
                  <NavRow
                    key={itemPath}
                    item={{ ...item, href }}
                    isActive={isActive}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  const { settings } = useSettings();
  const t = useT();
  const { locale } = useLocale();
  return (
    <div className="flex items-center gap-3 px-1 py-1">
      <Logo href={null} size="sm" className="h-14 w-auto" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#3E2A1F]">
          {displayStoreName(locale, settings?.storeName)}
        </p>
        <p className="truncate text-[11px] text-[#A89B68]">
          {t("admin.subtitle", "לוח ניהול")}
        </p>
      </div>
    </div>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT();
  const { logout } = useAuth();
  const storeHref =
    typeof window !== "undefined"
      ? publicStoreHref(window.location.hostname)
      : "/";

  return (
    <div className="space-y-1 border-t border-[#E6D7C3] pt-3">
      <Link
        href={storeHref}
        onClick={onNavigate}
        className="admin-sidebar-link"
      >
        <Store className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="truncate">{t("admin.backToStore")}</span>
      </Link>
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          void logout();
        }}
        className="admin-sidebar-link w-full text-start"
      >
        <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="truncate">{t("admin.signOut")}</span>
      </button>
    </div>
  );
}

/**
 * Desktop sidebar — part of CSS Grid column, NOT fixed overlay.
 * Sticky within column, 100vh, internal scroll when nav is long.
 */
export function AdminSidebar() {
  const t = useT();
  return (
    <aside
      className={cn(
        ADMIN_LAYOUT.sidebarVisible,
        "admin-sidebar sticky top-0 h-screen shrink-0 flex-col",
        "border-s"
      )}
      style={{ width: ADMIN_SIDEBAR_WIDTH_PX }}
      aria-label={t("admin.subtitle")}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <SidebarBrand />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          <NavSections />
        </div>
        <SidebarFooter />
      </div>
    </aside>
  );
}

/** Mobile + tablet drawer — overlay allowed only below lg */
export function AdminMobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const { dir } = useLocale();
  // RTL: slide in from the right (matches sidebar position on desktop).
  // LTR: slide in from the left.
  const offScreen = dir === "rtl" ? "100%" : "-100%";
  const sideClass = dir === "rtl" ? "end-0" : "start-0";

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className={cn("fixed inset-0 z-40 bg-black/50", ADMIN_LAYOUT.drawerOnly)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "admin-sidebar fixed inset-y-0 z-50 flex flex-col shadow-2xl transition-transform duration-250",
          ADMIN_LAYOUT.drawerOnly,
          sideClass
        )}
        style={{
          width: ADMIN_SIDEBAR_WIDTH_PX,
          transform: open ? "translateX(0)" : `translateX(${offScreen})`,
        }}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <SidebarBrand />
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6E2132] transition-colors hover:bg-[#EFE4D1]"
              aria-label={t("common.close", "סגור")}
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            <NavSections onNavigate={onClose} />
          </div>
          <SidebarFooter onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
