"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Info } from "lucide-react";
import { isMockMode } from "@/lib/data-provider/mode";

/**
 * HAAT-style demo indicator — a tiny, unobtrusive badge that only appears
 * while running on the mock data provider. The old full-width banner
 * (which took up prime storefront real-estate) has been removed; a richer
 * notice is shown inside the Admin via {@link DemoModeAdminNotice}.
 *
 * - Customer-facing: a small floating "Demo" chip in the corner, dismissible.
 * - Admin pages (`/admin/*`): the chip is suppressed because the admin UI
 *   already surfaces its own notice (see admin-shell).
 */
const DISMISS_KEY = "store-demo-badge-dismissed-v2";

export function DemoModeBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const mock = isMockMode();

  useEffect(() => {
    setMounted(true);
    if (!mock) return;
    try {
      const dismissed = window.sessionStorage.getItem(DISMISS_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [mock]);

  if (!mounted || !mock || !visible) return null;
  if (pathname?.startsWith("/admin")) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={dismiss}
      aria-label="Demo mode — tap to dismiss"
      className="pointer-events-auto fixed bottom-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom,0px)+12px)] end-3 z-[55] inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50/95 px-2.5 py-1 text-[11px] font-semibold text-amber-900 shadow-sm backdrop-blur transition-opacity hover:opacity-80 md:bottom-4"
    >
      <Info className="h-3 w-3" strokeWidth={2.2} aria-hidden />
      Demo
    </button>
  );
}

/**
 * Richer notice shown inside the admin shell so operators understand that
 * mock data is local to the current browser. Mounted in admin pages only.
 */
export function DemoModeAdminNotice() {
  if (!isMockMode()) return null;
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <div className="flex-1 leading-snug">
        <strong className="font-semibold">Demo mode.</strong>{" "}
        <span>
          This installation is running with mock data. Products, orders, and
          settings you edit here are saved to this browser only — they are not
          synced to any backend or shared across devices.
        </span>
      </div>
    </div>
  );
}
