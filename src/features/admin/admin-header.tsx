"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Menu,
  Store,
  Moon,
  Sun,
  Search,
} from "lucide-react";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/components/providers/auth-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/brand/logo";
import { displayStoreName } from "@/lib/brand";
import { useLocale, useT } from "@/components/providers/locale-provider";
import { useSettings } from "@/hooks/useSettings";
import { useAdminPath } from "@/hooks/useAdminPath";
import { publicStoreHref } from "@/lib/domains/host-routing";
import { getAdminPageTitleKey } from "./admin-nav-config";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

/**
 * IBDA admin header — Shawarma-Amir inspired.
 *
 * Clean white bar with: mobile menu button, page title + store name,
 * notifications, language, theme toggle, "back to store" link, user menu.
 */
export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const t = useT();
  const { locale } = useLocale();
  const { user, logout } = useAuth();
  const { mounted, isDark, toggleTheme } = useAppTheme();
  const pathname = usePathname();
  const { settings } = useSettings();
  const adminPath = useAdminPath();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");

  const pageTitle = t(getAdminPageTitleKey(pathname));
  const storeHref =
    typeof window !== "undefined"
      ? publicStoreHref(window.location.hostname)
      : "/";
  const roleLabel =
    user?.role === "Admin"
      ? t("admin.role.admin", "מנהל")
      : user?.role === "Manager"
        ? t("admin.role.manager", "מנהל סניף")
        : t("admin.role.employee", "עובד");

  return (
    <header className="admin-topbar sticky top-0 z-30 backdrop-blur">
      <div className="flex h-[4.25rem] items-center gap-3 px-4 md:gap-4 md:px-6">
        {/* Mobile hamburger — opens the sidebar drawer */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E6D3B0] bg-[#FFFCF7] text-[#4A1522] transition-colors hover:border-[#C9A24A] lg:hidden"
          aria-label={t("admin.openMenu", "פתח תפריט")}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <Logo href={null} size="xs" className="hidden h-12 w-auto sm:block" />

        <div className="min-w-0 flex-1 md:flex-none">
          <p className="truncate text-[11px] font-medium tracking-wide text-[#A6843D]">
            {displayStoreName(locale, settings?.storeName)}
          </p>
          <h1 className="truncate font-display text-base font-semibold text-[#4A1522] md:text-lg">
            {pageTitle}
          </h1>
        </div>

        <form
          className="relative ms-auto hidden min-w-0 flex-1 justify-center md:flex"
          onSubmit={(event) => {
            event.preventDefault();
            const q = query.trim();
            router.push(q ? `${adminPath("products")}?q=${encodeURIComponent(q)}` : adminPath("products"));
          }}
        >
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A6843D]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("admin.action.search")}
            className="admin-search"
            aria-label={t("admin.action.search")}
          />
        </form>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={storeHref}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#E6D3B0] bg-[#FFFCF7] px-3 text-xs font-medium text-[#4A1522] transition-colors hover:border-[#C9A24A]"
          >
            <Store className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{t("admin.viewStore", "צפייה בחנות")}</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          disabled={!mounted}
          aria-label={isDark ? t("admin.lightMode", "מצב בהיר") : t("admin.darkMode", "מצב כהה")}
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#E6D3B0] bg-[#FFFCF7] text-[#4A1522] transition-colors hover:border-[#C9A24A] disabled:opacity-50 md:inline-flex"
        >
          {mounted ? (
            isDark ? (
              <Moon className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Sun className="h-4 w-4" strokeWidth={1.75} />
            )
          ) : (
            <Sun className="h-4 w-4 opacity-40" strokeWidth={1.75} />
          )}
        </button>

        <LanguageSwitcher compact className="hidden sm:inline-flex" />
        <LanguageSwitcher variant="dropdown" className="sm:hidden" />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D3B0] bg-[#FFFCF7] text-[#4A1522] transition-colors hover:border-[#C9A24A]"
            aria-label={t("admin.notifications", "התראות")}
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute end-0 mt-2 w-72 rounded-2xl border border-[#E6D3B0] bg-[#FFFCF7] p-4 shadow-lg"
              >
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {t("admin.notifications", "התראות")}
                </p>
                <p className="mt-2 text-xs text-[#777]">
                  {t("admin.noNotifications", "אין התראות חדשות")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex h-10 items-center gap-2 rounded-full border border-[#E6D3B0] bg-[#FFFCF7] px-2 transition-colors hover:border-[#C9A24A]"
          >
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6E2132, #8C3A45)" }}
            >
              {user?.displayName?.charAt(0) ?? "A"}
            </span>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-[#1A1A1A] md:block">
              {user?.displayName}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-[#777] md:block" strokeWidth={1.75} />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute end-0 mt-2 w-60 rounded-2xl border border-[#E6D3B0] bg-[#FFFCF7] py-2 shadow-lg"
              >
                <div className="border-b border-[#E6D3B0] px-4 py-3">
                  <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                    {user?.displayName}
                  </p>
                  <p dir="ltr" className="truncate text-start text-xs text-[#777]">{user?.email}</p>
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: "rgba(8,127,131,0.1)",
                      color: "var(--color-ds-primary)",
                    }}
                  >
                    {roleLabel}
                  </span>
                </div>
                <Link
                  href={adminPath("settings")}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A1A1A] transition-colors hover:bg-[#F8F7F5]"
                >
                  <User className="h-4 w-4" strokeWidth={1.75} />
                  {t("admin.profile", "פרופיל")}
                </Link>
                <Link
                  href={storeHref}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A1A1A] transition-colors hover:bg-[#F8F7F5] md:hidden"
                >
                  <Store className="h-4 w-4" strokeWidth={1.75} />
                  {t("admin.viewStore", "צפייה בחנות")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    void logout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  {t("admin.signOut", "התנתק")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
