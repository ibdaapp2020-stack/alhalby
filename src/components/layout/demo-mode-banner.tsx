"use client";

import { useEffect, useState } from "react";
import { X, Info } from "lucide-react";
import { isMockMode } from "@/lib/data-provider/mode";

/**
 * A thin banner that appears on every page while the app runs with the
 * mock data provider. Explains that changes aren't synced across devices
 * so admins don't mistake the demo for a real deployment.
 *
 * Dismissed banner state is kept in localStorage for the current browser.
 */
const DISMISS_KEY = "store-demo-mode-banner-dismissed-v1";

export function DemoModeBanner() {
  const [visible, setVisible] = useState(false);
  const mock = isMockMode();

  useEffect(() => {
    if (!mock) return;
    try {
      const dismissed = window.localStorage.getItem(DISMISS_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [mock]);

  if (!mock || !visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="sticky top-0 z-[60] w-full border-b border-amber-200/70 bg-amber-50/95 text-amber-900 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-2 text-xs sm:text-sm">
        <Info className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        <p className="flex-1 leading-snug">
          <strong className="font-semibold">Demo mode.</strong>{" "}
          <span>
            This store is running with sample data. Changes you make are saved
            locally to this browser only and are not shared with other devices.
          </span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss demo mode banner"
          className="rounded-full p-1 hover:bg-amber-200/60"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
