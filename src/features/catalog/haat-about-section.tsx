"use client";

import { Clock, MapPin, Phone, Sparkles } from "lucide-react";
import { useLocale, useT } from "@/components/providers/locale-provider";
import { useSettings } from "@/hooks/useSettings";
import { useTenant } from "@/components/providers/tenant-provider";
import { displayStoreName } from "@/lib/brand";

/**
 * HAAT-style "About the store" block for the home page.
 *
 * Pulls name / tagline / hours / contact from the active tenant settings
 * (overridable from Admin → Settings), keeping copy localised in he/ar/en.
 */
export function HaatAboutSection() {
  const t = useT();
  const { locale } = useLocale();
  const { settings } = useSettings();
  const tenant = useTenant();

  const storeName = displayStoreName(locale, settings?.storeName || tenant.brand.name);
  const tagline = t("brand.tagline", tenant.brand.tagline);
  const phone = settings?.phone || tenant.contact.phone;
  const address = settings?.address || tenant.contact.address;
  const hours = settings?.hours || tenant.hours.summary;

  const items = [
    hours
      ? {
          icon: Clock,
          label: t("footer.hours", "שעות פתיחה"),
          value: hours,
        }
      : null,
    phone
      ? {
          icon: Phone,
          label: t("footer.contact", "צור קשר"),
          value: phone,
        }
      : null,
    address
      ? {
          icon: MapPin,
          label: t("checkout.address", "כתובת"),
          value: address,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section
      id="about"
      className="haat-container scroll-mt-24"
    >
      <div className="haat-card grid gap-4 overflow-hidden p-4 sm:p-5 md:grid-cols-[1.1fr_1fr] md:gap-6 md:p-6">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ds-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ds-primary">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            {t("home.aboutBadge", "אודות")}
          </span>
          <h2 className="haat-section-title">{storeName}</h2>
          <p className="max-w-md text-sm leading-relaxed text-ds-text-muted md:text-[15px]">
            {tagline ||
              t(
                "home.aboutBody",
                "ממתקים מזרחיים בעבודת יד — בקלאווה, כנאפה ומתוקים מסורתיים."
              )}
          </p>
        </div>

        {items.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            {items.map((item) => (
              <li
                key={item.label}
                className="flex items-start gap-3 rounded-xl border border-ds-border bg-ds-bg px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ds-primary/10 text-ds-primary">
                  <item.icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ds-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-ds-text">
                    {item.value}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
