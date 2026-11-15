"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHideCustomerChrome } from "@/hooks/useAdminPath";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useCart } from "@/features/cart/cart-context";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", labelKey: "nav.home", exact: true },
  { href: "/catalog", labelKey: "nav.catalog" },
  { href: "/#offers", labelKey: "nav.offers" },
  { href: "/#about", labelKey: "nav.about" },
  { href: "/account", labelKey: "nav.contact" },
] as const;

export function SiteHeader() {
  const { itemCount, openCart } = useCart();
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const hideChrome = useHideCustomerChrome();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 4));

  // Close mobile drawer / search on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  if (hideChrome) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    if (!q) return;
    router.push(`/catalog?search=${encodeURIComponent(q)}`);
    setSearchQuery("");
  };

  return (
    <>
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "sticky top-0 z-40 border-b border-[#E4D3B4] bg-[#FFFCF7]/95 backdrop-blur transition-shadow duration-300",
          scrolled ? "shadow-[0_1px_8px_rgba(16,14,12,0.06)]" : "shadow-none"
        )}
      >
        {/* ─── Desktop ─── */}
        <div className="hidden h-20 w-full items-center gap-4 px-6 lg:flex lg:px-10">
          <div className="shrink-0">
            <Logo size="md" href="/" priority className="h-16 w-auto" />
          </div>

          <nav className="flex flex-1 items-center justify-center gap-1" aria-label="Main">
            {NAV_LINKS.map((link) => {
              const isActive =
                "exact" in link && link.exact
                  ? pathname === link.href
                  : pathname === link.href || pathname.startsWith(link.href.replace("/#", "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-ds-primary"
                      : "text-ds-text/75 hover:bg-ds-surface-muted hover:text-ds-text"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t("header.search")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ds-border bg-ds-surface text-ds-text transition-colors hover:border-ds-primary hover:text-ds-primary"
            >
              <Search className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <LanguageSwitcher compact />

            <Link
              href="/account"
              aria-label={t("nav.account")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ds-border bg-ds-surface text-ds-text transition-colors hover:border-ds-primary hover:text-ds-primary"
            >
              <User className="h-4 w-4" strokeWidth={1.75} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={t("cart.openCart", "פתח עגלה")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ds-border bg-ds-surface text-ds-text transition-colors hover:border-ds-primary hover:text-ds-primary"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ds-primary px-1 text-[10px] font-bold text-ds-text-on-primary">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ─── Mobile / Tablet ─── */}
        <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t("nav.menu", "תפריט")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ds-border bg-ds-surface text-ds-text"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div className="flex-1 min-w-0 flex justify-center">
            <Logo size="sm" href="/" priority className="h-12 w-auto" />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t("header.search")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ds-border bg-ds-surface text-ds-text"
            >
              <Search className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={t("cart.openCart", "פתח עגלה")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ds-border bg-ds-surface text-ds-text"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ds-primary px-1 text-[10px] font-bold text-ds-text-on-primary">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ─── Inline search drop-down ─── */}
        <AnimatePresence initial={false}>
          {searchOpen && (
            <motion.div
              key="search"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-ds-border bg-ds-surface"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 md:px-6"
              >
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ds-text-muted"
                    strokeWidth={1.75}
                  />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("header.search")}
                    className="h-11 w-full rounded-full border border-ds-border bg-ds-bg px-4 ps-10 text-sm text-ds-text outline-none focus:border-ds-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label={t("common.close")}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-ds-text-muted hover:bg-ds-surface-muted"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ─── Mobile menu drawer ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[70] bg-black/40 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 z-[71] flex w-[82vw] max-w-[340px] flex-col bg-ds-surface shadow-2xl lg:hidden start-0 rtl:start-auto rtl:end-0"
              style={{
                // RTL: slide from the right. Keep inline control for both dirs.
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-ds-border px-4 py-3">
                <Logo size="xs" href="/" className="h-8 w-auto" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label={t("common.close")}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ds-text-muted hover:bg-ds-surface-muted"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Mobile">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => {
                    const isActive =
                      "exact" in link && link.exact
                        ? pathname === link.href
                        : pathname === link.href ||
                          pathname.startsWith(link.href.replace("/#", "/"));
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-ds-primary/10 text-ds-primary"
                              : "text-ds-text hover:bg-ds-surface-muted"
                          )}
                        >
                          {t(link.labelKey)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-5 border-t border-ds-border pt-4">
                  <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ds-text-muted">
                    {t("lang.switch")}
                  </p>
                  <div className="px-4">
                    <LanguageSwitcher />
                  </div>
                </div>
              </nav>

              <div className="border-t border-ds-border px-3 py-3">
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ds-text hover:bg-ds-surface-muted"
                >
                  <User className="h-4 w-4" strokeWidth={1.75} />
                  {t("nav.account")}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** @deprecated Use SiteHeader — kept for catalog search integration */
export function Header({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  void searchQuery;
  void onSearchChange;
  return <SiteHeader />;
}
