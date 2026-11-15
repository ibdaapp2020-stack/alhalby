"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/features/admin/image-upload";
import {
  subscribeToSettings,
  updateSettings,
  DEFAULT_HOMEPAGE_SECTIONS,
  type AppSettings,
  type CategoryVariant,
  type HomepageConfig,
  type HomepageSection,
  type ProductCardVariant,
} from "@/services/settingsService";
import {
  uploadSettingsImage,
  deleteImageByUrl,
} from "@/services/storageService";
import { SystemStatusCard } from "@/features/admin/system-status-card";
import { useT } from "@/components/providers/locale-provider";
import { AdminPageHeader } from "./components/admin-page-header";
import { AdminCard } from "./components/admin-card";
import { adminInput } from "./components/admin-styles";

export function SettingsAdmin() {
  const t = useT();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    return subscribeToSettings(setSettings, () => {});
  }, []);

  if (!settings) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-turquoise" />
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await updateSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeLabels = {
    primary: t("admin.settings.themePrimary"),
    accent: t("admin.settings.themeAccent"),
    background: t("admin.settings.themeBackground"),
  } as const;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("admin.settings.title")}
        subtitle={t("admin.settings.subtitle")}
        actions={
          <Button onClick={handleSave} disabled={saving} className="h-10 rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? t("admin.action.saved") : t("admin.settings.saveChanges")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title={t("admin.settings.businessInfo")}>
          <div className="space-y-4">
            <div>
              <Label>{t("admin.settings.storeName")}</Label>
              <Input
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className={`mt-1 ${adminInput}`}
              />
            </div>
            <div>
              <Label>{t("admin.settings.phone")}</Label>
              <Input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className={`mt-1 ${adminInput}`}
              />
            </div>
            <div>
              <Label>{t("admin.settings.address")}</Label>
              <Input
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className={`mt-1 ${adminInput}`}
              />
            </div>
            <div>
              <Label>{t("admin.settings.hours")}</Label>
              <Textarea
                value={settings.hours}
                onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                className={`mt-1 rounded-xl ${adminInput}`}
              />
            </div>
          </div>
        </AdminCard>

        <AdminCard title={t("admin.settings.branding")}>
          <div className="space-y-4">
            <ImageUpload
              label={t("admin.settings.logo")}
              value={settings.logoUrl}
              onChange={(url) => setSettings({ ...settings, logoUrl: url })}
              onUpload={(file, onProgress) => uploadSettingsImage(file, "logo", onProgress)}
              onDelete={deleteImageByUrl}
            />
            <ImageUpload
              label={t("admin.settings.storeImage")}
              value={settings.storeImageUrl}
              onChange={(url) => setSettings({ ...settings, storeImageUrl: url })}
              onUpload={(file, onProgress) => uploadSettingsImage(file, "store", onProgress)}
              onDelete={deleteImageByUrl}
            />
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-beige-dark/20 px-4 py-3 dark:border-white/10">
              <input
                type="checkbox"
                checked={settings.showProductThumbnails}
                onChange={(e) =>
                  setSettings({ ...settings, showProductThumbnails: e.target.checked })
                }
                className="h-4 w-4 rounded border-beige-dark text-turquoise focus:ring-turquoise"
              />
              <span className="text-sm text-coffee dark:text-warm-white/90">
                {t("admin.settings.showProductThumbnails")}
              </span>
            </label>
          </div>
        </AdminCard>

        <AdminCard title={t("admin.settings.seoSocial")} className="dark:bg-[#1a1412]/80">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("admin.settings.seoTitle")}</Label>
              <Input
                value={settings.seo.title}
                onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, title: e.target.value } })}
                className={`mt-1 ${adminInput}`}
              />
            </div>
            <div>
              <Label>{t("admin.settings.whatsapp")}</Label>
              <Input
                value={settings.social.whatsapp}
                onChange={(e) => setSettings({ ...settings, social: { ...settings.social, whatsapp: e.target.value } })}
                className={`mt-1 ${adminInput}`}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>{t("admin.settings.seoDescription")}</Label>
              <Textarea
                value={settings.seo.description}
                onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, description: e.target.value } })}
                className={`mt-1 rounded-xl ${adminInput}`}
              />
            </div>
            <div>
              <Label>{t("admin.settings.instagram")}</Label>
              <Input
                value={settings.social.instagram}
                onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })}
                className={`mt-1 ${adminInput}`}
              />
            </div>
            <div>
              <Label>{t("admin.settings.mapsUrl")}</Label>
              <Input
                value={settings.mapsUrl}
                onChange={(e) => setSettings({ ...settings, mapsUrl: e.target.value })}
                className={`mt-1 ${adminInput}`}
              />
            </div>
          </div>
        </AdminCard>

        <SystemStatusCard />

        <AdminCard title={t("admin.settings.themeColors")} className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            {(["primary", "accent", "background"] as const).map((key) => (
              <div key={key}>
                <Label>{themeLabels[key]}</Label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="color"
                    value={settings.theme[key]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, [key]: e.target.value },
                      })
                    }
                    className="h-10 w-12 cursor-pointer rounded-lg border"
                  />
                  <Input
                    value={settings.theme[key]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        theme: { ...settings.theme, [key]: e.target.value },
                      })
                    }
                    className={adminInput}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <HomepageLayoutCard
          value={settings.homepage}
          onChange={(homepage) => setSettings({ ...settings, homepage })}
        />
      </div>
    </div>
  );
}

/**
 * HAAT-style homepage layout controls. Lets the admin toggle & reorder
 * the sections rendered by the storefront HomeView plus swap category /
 * product-card presentation styles — all persisted in `settings.homepage`.
 */
const SECTION_META: Record<HomepageSection, { labelKey: string; fallback: string }> = {
  hero: { labelKey: "admin.homepage.hero", fallback: "באנר ראשי" },
  categories: { labelKey: "admin.homepage.categories", fallback: "קטגוריות" },
  featured: { labelKey: "admin.homepage.featured", fallback: "מוצרים מומלצים" },
  promo: { labelKey: "admin.homepage.promo", fallback: "באנר מבצע" },
  new: { labelKey: "admin.homepage.new", fallback: "חדש בחנות" },
  all: { labelKey: "admin.homepage.all", fallback: "כל המוצרים" },
  about: { labelKey: "admin.homepage.about", fallback: "אודות החנות" },
};

const CATEGORY_VARIANTS: { id: CategoryVariant; labelKey: string; fallback: string }[] = [
  { id: "card", labelKey: "admin.homepage.catCard", fallback: "כרטיס עם תמונה" },
  { id: "circle", labelKey: "admin.homepage.catCircle", fallback: "תמונה עגולה" },
  { id: "horizontal", labelKey: "admin.homepage.catHorizontal", fallback: "כרטיס אופקי" },
];

const PRODUCT_VARIANTS: { id: ProductCardVariant; labelKey: string; fallback: string }[] = [
  { id: "haat", labelKey: "admin.homepage.prodHaat", fallback: "HAAT (אנכי)" },
  { id: "classic", labelKey: "admin.homepage.prodClassic", fallback: "קלאסי (אופקי)" },
];

function HomepageLayoutCard({
  value,
  onChange,
}: {
  value: HomepageConfig | undefined;
  onChange: (next: HomepageConfig) => void;
}) {
  const t = useT();
  const config: HomepageConfig = {
    sections:
      value?.sections && value.sections.length > 0
        ? value.sections
        : DEFAULT_HOMEPAGE_SECTIONS,
    categoryVariant: value?.categoryVariant ?? "card",
    productCardVariant: value?.productCardVariant ?? "haat",
  };

  const toggle = (id: HomepageSection) => {
    const present = config.sections.includes(id);
    const next = present
      ? config.sections.filter((s) => s !== id)
      : [...config.sections, id];
    onChange({ ...config, sections: next });
  };

  const move = (id: HomepageSection, delta: -1 | 1) => {
    const index = config.sections.indexOf(id);
    if (index < 0) return;
    const target = index + delta;
    if (target < 0 || target >= config.sections.length) return;
    const next = [...config.sections];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange({ ...config, sections: next });
  };

  const reset = () =>
    onChange({
      sections: DEFAULT_HOMEPAGE_SECTIONS,
      categoryVariant: "card",
      productCardVariant: "haat",
    });

  // Hidden sections are shown as "add back" chips below the list.
  const hiddenSections = DEFAULT_HOMEPAGE_SECTIONS.filter(
    (s) => !config.sections.includes(s)
  );

  return (
    <AdminCard
      title={t("admin.homepage.title", "פריסת דף הבית (HAAT)")}
      className="lg:col-span-2"
    >
      <div className="space-y-5">
        <p className="text-xs text-coffee/60 dark:text-warm-white/60">
          {t(
            "admin.homepage.hint",
            "הפעלה, סידור ועיצוב של אזורי דף הבית. השינויים נשמרים ל-MOCK DATA בלבד."
          )}
        </p>

        <div>
          <Label>{t("admin.homepage.order", "סדר אזורי דף הבית")}</Label>
          <ul className="mt-2 space-y-2">
            {config.sections.map((id, idx) => (
              <li
                key={id}
                className="flex items-center gap-2 rounded-xl border border-beige-dark/20 bg-cream/40 px-3 py-2 dark:border-white/10"
              >
                <span className="flex-1 text-sm font-medium text-coffee dark:text-warm-white/90">
                  {t(SECTION_META[id].labelKey, SECTION_META[id].fallback)}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => move(id, -1)}
                    disabled={idx === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => move(id, 1)}
                    disabled={idx === config.sections.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-red-600"
                    onClick={() => toggle(id)}
                  >
                    {t("admin.homepage.hide", "הסתר")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {hiddenSections.length > 0 && (
          <div>
            <Label>{t("admin.homepage.hidden", "אזורים מוסתרים")}</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {hiddenSections.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className="rounded-full border border-beige-dark/30 bg-warm-white px-3 py-1.5 text-xs font-medium text-coffee hover:border-turquoise/50 hover:text-turquoise dark:border-white/10 dark:bg-white/5 dark:text-warm-white/80"
                >
                  + {t(SECTION_META[id].labelKey, SECTION_META[id].fallback)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("admin.homepage.catStyle", "סגנון קטגוריות")}</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_VARIANTS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onChange({ ...config, categoryVariant: v.id })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    config.categoryVariant === v.id
                      ? "border-turquoise bg-turquoise text-white"
                      : "border-beige-dark/30 bg-warm-white text-coffee hover:border-turquoise/50 dark:border-white/10 dark:bg-white/5 dark:text-warm-white/80"
                  }`}
                >
                  {t(v.labelKey, v.fallback)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>{t("admin.homepage.prodStyle", "סגנון כרטיסי מוצרים")}</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRODUCT_VARIANTS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onChange({ ...config, productCardVariant: v.id })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    config.productCardVariant === v.id
                      ? "border-turquoise bg-turquoise text-white"
                      : "border-beige-dark/30 bg-warm-white text-coffee hover:border-turquoise/50 dark:border-white/10 dark:bg-white/5 dark:text-warm-white/80"
                  }`}
                >
                  {t(v.labelKey, v.fallback)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-xs text-coffee/70"
          >
            {t("admin.homepage.reset", "אפס לברירת מחדל")}
          </Button>
        </div>
      </div>
    </AdminCard>
  );
}
