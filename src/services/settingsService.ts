import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { nowTimestamp } from "@/types/firestore";
import { ServiceError, type ServiceResult, success, failure } from "@/lib/errors";
import type { FirestoreSettings } from "@/types/firestore";
import { BRAND } from "@/lib/brand";
import { isMockMode } from "@/lib/data-provider/mode";
import { mockSettings as mock } from "@/lib/data-provider/mock";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  sanitizeHomepageConfig,
  type HomepageConfig,
} from "@/services/homepage-config";

// Re-export the lightweight homepage config module so existing consumers
// that import from "@/services/settingsService" keep working.
export {
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_HOMEPAGE_CONFIG,
  sanitizeHomepageConfig,
} from "@/services/homepage-config";
export type {
  HomepageSection,
  CategoryVariant,
  ProductCardVariant,
  HomepageConfig,
} from "@/services/homepage-config";

export interface AppSettings {
  storeName: string;
  logoUrl: string;
  storeImageUrl: string;
  showProductThumbnails: boolean;
  phone: string;
  address: string;
  hours: string;
  currency: string;
  theme: {
    primary: string;
    accent: string;
    background: string;
  };
  seo: { title: string; description: string };
  social: { instagram: string; facebook: string; whatsapp: string };
  mapsUrl: string;
  faviconUrl: string;
  /** Optional HAAT-style homepage layout controls (admin-editable). */
  homepage?: HomepageConfig;
}

const DEFAULT_SETTINGS: AppSettings = {
  storeName: BRAND.name,
  logoUrl: BRAND.logo,
  storeImageUrl: BRAND.store,
  showProductThumbnails: true,
  phone: "",
  address: "",
  hours: "Sun–Thu 7:00–22:00",
  currency: "ILS",
  theme: {
    primary: "#3D2B24",
    accent: "#007A80",
    background: "#F8F3ED",
  },
  seo: { title: BRAND.name, description: BRAND.taglineAlt },
  social: { instagram: "", facebook: "", whatsapp: "" },
  mapsUrl: "",
  faviconUrl: BRAND.logo,
  homepage: DEFAULT_HOMEPAGE_CONFIG,
};

function mapSettings(data: FirestoreSettings | undefined): AppSettings {
  if (!data) return DEFAULT_SETTINGS;
  return {
    storeName: data.storeName ?? DEFAULT_SETTINGS.storeName,
    logoUrl: data.logoUrl ?? DEFAULT_SETTINGS.logoUrl,
    storeImageUrl: data.storeImageUrl ?? DEFAULT_SETTINGS.storeImageUrl,
    showProductThumbnails: data.showProductThumbnails ?? DEFAULT_SETTINGS.showProductThumbnails,
    phone: data.phone ?? "",
    address: data.address ?? "",
    hours: data.hours ?? DEFAULT_SETTINGS.hours,
    currency: data.currency ?? "ILS",
    theme: data.theme ?? DEFAULT_SETTINGS.theme,
    seo: data.seo ?? DEFAULT_SETTINGS.seo,
    social: data.social ?? DEFAULT_SETTINGS.social,
    mapsUrl: data.mapsUrl ?? "",
    faviconUrl: data.faviconUrl ?? DEFAULT_SETTINGS.faviconUrl,
    homepage: sanitizeHomepageConfig(data.homepage),
  };
}

export async function getSettings(): Promise<AppSettings> {
  if (isMockMode()) return mock.getSettings();
  try {
    const db = getDb();
    const snap = await getDoc(doc(db, COLLECTIONS.settings, "app"));
    if (!snap.exists()) return DEFAULT_SETTINGS;
    return mapSettings(snap.data() as FirestoreSettings);
  } catch (error) {
    throw new ServiceError(
      error instanceof Error ? error.message : "Failed to fetch settings",
      "SETTINGS_READ_FAILED"
    );
  }
}

export function subscribeToSettings(
  onData: (settings: AppSettings) => void,
  onError: (error: string) => void
): Unsubscribe {
  if (isMockMode()) return mock.subscribeToSettings(onData, onError);
  try {
    const db = getDb();
    return onSnapshot(
      doc(db, COLLECTIONS.settings, "app"),
      (snap) => {
        onData(mapSettings(snap.exists() ? (snap.data() as FirestoreSettings) : undefined));
      },
      (err) => onError(err.message)
    );
  } catch (error) {
    onError(error instanceof Error ? error.message : "Failed to subscribe");
    return () => {};
  }
}

export async function updateSettings(
  input: Partial<AppSettings>
): Promise<ServiceResult<AppSettings>> {
  if (isMockMode()) return mock.updateSettings(input);
  try {
    const db = getDb();
    const ref = doc(db, COLLECTIONS.settings, "app");
    await setDoc(
      ref,
      { ...input, updatedAt: nowTimestamp() },
      { merge: true }
    );
    const snap = await getDoc(ref);
    return success(mapSettings(snap.data() as FirestoreSettings));
  } catch (error) {
    return failure(error, "Failed to update settings");
  }
}
