"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { subscribeToSettings, type AppSettings } from "@/services/settingsService";
import {
  applyTenantCssVars,
  mergeTenantConfig,
  resolveFallbackPreset,
  type TenantConfig,
  type TenantConfigPatch,
} from "@/lib/tenant";

type TenantContextValue = {
  config: TenantConfig;
  loading: boolean;
};

const TenantContext = createContext<TenantContextValue | null>(null);

/**
 * Translate the legacy AppSettings shape (what the Admin → Settings page writes
 * to Firestore today) into a TenantConfigPatch. This is the only place the
 * mapping lives, so we can evolve the Firestore schema without touching
 * consumer code.
 */
function settingsToPatch(settings: AppSettings | null): TenantConfigPatch | null {
  if (!settings) return null;
  return {
    brand: {
      name: settings.storeName,
      logoUrl: settings.logoUrl,
      storeImageUrl: settings.storeImageUrl,
      faviconUrl: settings.faviconUrl,
    },
    palette: {
      primary: settings.theme?.primary,
      secondary: settings.theme?.accent,
      bg: settings.theme?.background,
    },
    contact: {
      phone: settings.phone,
      address: settings.address,
      mapsUrl: settings.mapsUrl,
      whatsapp: settings.social?.whatsapp,
      instagram: settings.social?.instagram,
      facebook: settings.social?.facebook,
    },
    hours: {
      summary: settings.hours,
    },
    currency: (settings.currency as TenantConfig["currency"]) || "ILS",
    seo: settings.seo,
  };
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const fallback = useMemo(() => resolveFallbackPreset(), []);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToSettings(
      (data) => {
        setSettings(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const config = useMemo(
    () => mergeTenantConfig(fallback, settingsToPatch(settings)),
    [fallback, settings]
  );

  // Apply CSS vars at runtime so palette changes in Admin → Settings reflect
  // live. On first paint we rely on the inline <style> emitted by TenantBootstrap.
  useEffect(() => {
    if (typeof document === "undefined") return;
    applyTenantCssVars(document.documentElement, config);
  }, [config]);

  const value = useMemo<TenantContextValue>(
    () => ({ config, loading }),
    [config, loading]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantConfig {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    // Fail safe: if a component renders outside TenantProvider (e.g. during
    // server-only rendering of a utility) return the fallback preset.
    return resolveFallbackPreset();
  }
  return ctx.config;
}

export function useTenantLoading(): boolean {
  const ctx = useContext(TenantContext);
  return ctx?.loading ?? true;
}

/**
 * Convenience hooks for the most-used slices. Keep these aligned with
 * TenantConfig so refactors stay typesafe.
 */
export function useTenantBrand() {
  return useTenant().brand;
}

export function useTenantPalette() {
  return useTenant().palette;
}

export function useTenantFeatures() {
  return useTenant().features;
}

export function useTenantOrdering() {
  return useTenant().ordering;
}

export function useTenantPayments() {
  return useTenant().payments;
}
