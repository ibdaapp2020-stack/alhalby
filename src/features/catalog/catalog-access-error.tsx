"use client";

import { ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/layout/header";
import { CatalogModifierPreviewProvider } from "@/features/catalog/catalog-modifier-preview-context";
import { useT } from "@/components/providers/locale-provider";

export function isCatalogAccessError(message: string | null | undefined): boolean {
  if (!message) return false;
  const text = message.toLowerCase();
  return (
    text.includes("permission") ||
    text.includes("insufficient") ||
    text.includes("permission-denied") ||
    text.includes("403")
  );
}

/** Shown when Firestore denies the catalog read, instead of an empty shop. */
export function CatalogAccessError() {
  const t = useT();
  return (
    <CatalogModifierPreviewProvider>
      <>
        <SiteHeader />
        <section className="haat-container flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ds-primary/10 text-ds-primary">
            <ShieldAlert className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold text-ds-text">
            {t("catalog.accessTitle", "לא ניתן לטעון את המוצרים")}
          </h1>
          <p className="text-sm leading-relaxed text-ds-text-muted">
            {t(
              "catalog.accessBody",
              "הקריאה נחסמה בגלל הרשאות. זו לא חנות ריקה — צריך לאפשר קריאה של המוצרים והקטגוריות שמיועדים לאתר."
            )}
          </p>
        </section>
      </>
    </CatalogModifierPreviewProvider>
  );
}
