"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Ticket,
  Percent,
  Tag,
  Truck,
  Trash2,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { AdminPageHeader } from "./components/admin-page-header";
import { useT } from "@/components/providers/locale-provider";
import { mockCoupons, type CouponType, type MockCoupon } from "@/lib/mock-data";
import { isMockMode } from "@/lib/data-provider/mode";
import { deleteCoupon, saveCoupon, subscribeToCoupons } from "@/services/couponService";
import { formatPrice } from "@/lib/utils";

const STORAGE_KEY = "ibda-mock-coupons-v1";

function loadCoupons(): MockCoupon[] {
  if (typeof window === "undefined") return mockCoupons;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockCoupon[];
  } catch {
    /* ignore storage errors */
  }
  return mockCoupons;
}

function persistCoupons(coupons: MockCoupon[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  } catch {
    /* ignore storage errors */
  }
}

function emptyCoupon(): MockCoupon {
  return {
    id: `cp-${Date.now().toString(36)}`,
    code: "",
    description: "",
    type: "percent",
    value: 10,
    minOrder: 0,
    expiresAt: null,
    maxUses: null,
    uses: 0,
    active: true,
  };
}

/**
 * IBDA Store Base — mock coupons & promotions admin.
 *
 * Fully local: changes are persisted to `localStorage` so operators can
 * exercise the create / edit / toggle / delete flows without a backend.
 * Styled with the Shawarma-Amir admin tokens (white cards + soft borders +
 * teal primary accents).
 */
export function CouponsAdmin() {
  const t = useT();
  const firebaseMode = !isMockMode();
  const [coupons, setCoupons] = useState<MockCoupon[]>(firebaseMode ? [] : mockCoupons);
  const [editing, setEditing] = useState<MockCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseMode) {
      setCoupons(loadCoupons());
      return;
    }
    return subscribeToCoupons(
      (rows) => {
        setCoupons(rows);
        setError(null);
      },
      (message) => setError(message)
    );
  }, [firebaseMode]);

  const activeCount = useMemo(() => coupons.filter((c) => c.active).length, [coupons]);
  const totalUses = useMemo(
    () => coupons.reduce((sum, c) => sum + c.uses, 0),
    [coupons]
  );

  const updateLocal = (next: MockCoupon[]) => {
    setCoupons(next);
    persistCoupons(next);
  };

  const toggleActive = (id: string) => {
    const current = coupons.find((c) => c.id === id);
    if (!current) return;
    const next = { ...current, active: !current.active };
    if (!firebaseMode) {
      updateLocal(coupons.map((c) => (c.id === id ? next : c)));
      return;
    }
    void saveCoupon(next).catch((err) => setError(err instanceof Error ? err.message : "Save failed"));
  };

  const remove = (id: string) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        t("admin.coupons.confirmDelete", "למחוק את הקופון?")
      );
      if (!ok) return;
    }
    if (!firebaseMode) {
      updateLocal(coupons.filter((c) => c.id !== id));
      return;
    }
    void deleteCoupon(id).catch((err) => setError(err instanceof Error ? err.message : "Delete failed"));
  };

  const save = (coupon: MockCoupon) => {
    const normalized: MockCoupon = {
      ...coupon,
      code: coupon.code.trim().toUpperCase(),
      value: Number(coupon.value) || 0,
      minOrder: coupon.minOrder ? Number(coupon.minOrder) : 0,
      maxUses: coupon.maxUses ? Number(coupon.maxUses) : null,
      expiresAt: coupon.expiresAt || null,
    };
    if (!normalized.code) {
      alert(t("admin.coupons.codeRequired", "קוד קופון הוא שדה חובה"));
      return;
    }
    if (!firebaseMode) {
      const exists = coupons.some((c) => c.id === normalized.id);
      const next = exists
        ? coupons.map((c) => (c.id === normalized.id ? normalized : c))
        : [...coupons, normalized];
      updateLocal(next);
      setEditing(null);
      return;
    }
    const previousId = coupon.id !== normalized.code ? coupon.id : "";
    void saveCoupon(normalized)
      .then(async () => {
        if (previousId && previousId !== normalized.code) await deleteCoupon(previousId);
        setEditing(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Save failed"));
  };

  const typeIcon = (type: CouponType) => {
    if (type === "percent") return <Percent className="h-3.5 w-3.5" strokeWidth={1.75} />;
    if (type === "fixed") return <Tag className="h-3.5 w-3.5" strokeWidth={1.75} />;
    return <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />;
  };

  const typeLabel = (type: CouponType) =>
    type === "percent"
      ? t("admin.coupons.typePercent", "אחוזי הנחה")
      : type === "fixed"
        ? t("admin.coupons.typeFixed", "סכום הנחה")
        : t("admin.coupons.typeFreeDelivery", "משלוח חינם");

  const formatValue = (c: MockCoupon) => {
    if (c.type === "percent") return `${c.value}%`;
    if (c.type === "fixed") return formatPrice(c.value);
    return "—";
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t("admin.coupons", "קופונים ומבצעים")}
        subtitle={
          firebaseMode
            ? t("admin.coupons.subtitleLive", "קודי הנחה שנשמרים ב־Firestore. רק מנהל יכול ליצור או לשנות אותם.")
            : t("admin.coupons.subtitle", "קודי הנחה ומבצעים. השינויים נשמרים מקומית (MOCK DATA).")
        }
        actions={
          <button
            type="button"
            onClick={() => setEditing(emptyCoupon())}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ds-primary px-4 text-sm font-medium text-ds-text-on-primary transition-colors hover:bg-ds-primary-hover"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            {t("admin.coupons.add", "קופון חדש")}
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<Ticket className="h-5 w-5" strokeWidth={1.75} />}
          label={t("admin.coupons.total", "סך הכול קופונים")}
          value={coupons.length.toString()}
        />
        <SummaryCard
          icon={<Percent className="h-5 w-5" strokeWidth={1.75} />}
          label={t("admin.coupons.active", "פעילים")}
          value={activeCount.toString()}
        />
        <SummaryCard
          icon={<Tag className="h-5 w-5" strokeWidth={1.75} />}
          label={t("admin.coupons.uses", "שימושים")}
          value={totalUses.toString()}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {editing && (
        <CouponEditor
          coupon={editing}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={() => save(editing)}
        />
      )}

      <div className="admin-card overflow-hidden p-0">
        <div className="hidden grid-cols-[1.1fr_1fr_0.9fr_1fr_0.9fr_120px] items-center gap-3 border-b border-[#F0EDE7] bg-[#FAF9F7] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#777] md:grid">
          <span>{t("admin.coupons.code", "קוד")}</span>
          <span>{t("admin.coupons.description", "תיאור")}</span>
          <span>{t("admin.coupons.type", "סוג")}</span>
          <span>{t("admin.coupons.conditions", "תנאים")}</span>
          <span>{t("admin.coupons.uses", "שימושים")}</span>
          <span className="text-end">{t("admin.coupons.actions", "פעולות")}</span>
        </div>

        {coupons.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#777]">
            {t("admin.coupons.empty", "אין קופונים עדיין. לחצו \"קופון חדש\" כדי להתחיל.")}
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="grid grid-cols-1 items-center gap-2 border-b border-[#F0EDE7] px-4 py-4 last:border-b-0 md:grid-cols-[1.1fr_1fr_0.9fr_1fr_0.9fr_120px] md:gap-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="admin-chip"
                  style={{
                    backgroundColor: coupon.active
                      ? "rgba(8,127,131,0.12)"
                      : "rgba(119,119,119,0.14)",
                    color: coupon.active ? "var(--color-ds-primary)" : "#555",
                  }}
                >
                  {coupon.active
                    ? t("admin.coupons.statusActive", "פעיל")
                    : t("admin.coupons.statusInactive", "כבוי")}
                </span>
                <span dir="ltr" className="font-mono text-sm font-semibold text-[#1A1A1A]">
                  {coupon.code}
                </span>
              </div>

              <div className="min-w-0 text-sm text-[#1A1A1A]">
                <p className="truncate">{coupon.description || "—"}</p>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-[#1A1A1A]">
                {typeIcon(coupon.type)}
                <span className="truncate">{typeLabel(coupon.type)}</span>
                <span className="ms-1 font-semibold">{formatValue(coupon)}</span>
              </div>

              <div className="text-xs text-[#555]">
                {coupon.minOrder
                  ? `${t("admin.coupons.minOrder", "מינ׳")}: ${formatPrice(coupon.minOrder)}`
                  : t("admin.coupons.noMin", "ללא מינימום")}
                {coupon.expiresAt && (
                  <div>
                    {t("admin.coupons.expires", "תוקף")}:{" "}
                    {new Date(coupon.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="text-sm text-[#1A1A1A]">
                <span className="font-semibold">{coupon.uses}</span>
                <span className="text-[#777]">
                  {" "}
                  / {coupon.maxUses ?? "∞"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => toggleActive(coupon.id)}
                  className="rounded-lg border border-[#ECE9E4] px-2 py-1.5 text-xs font-medium text-[#1A1A1A] transition-colors hover:border-ds-primary hover:text-ds-primary"
                >
                  {coupon.active
                    ? t("admin.coupons.disable", "השבת")
                    : t("admin.coupons.enable", "הפעל")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(coupon)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ECE9E4] text-[#1A1A1A] transition-colors hover:border-ds-primary hover:text-ds-primary"
                  aria-label={t("admin.coupons.edit", "ערוך")}
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(coupon.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ECE9E4] text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                  aria-label={t("admin.coupons.delete", "מחק")}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="admin-card flex items-center gap-3 p-4">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl text-ds-primary"
        style={{ backgroundColor: "rgba(8,127,131,0.1)" }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="admin-kpi-label">{label}</p>
        <p className="admin-kpi-value">{value}</p>
      </div>
    </div>
  );
}

function CouponEditor({
  coupon,
  onChange,
  onCancel,
  onSave,
}: {
  coupon: MockCoupon;
  onChange: (next: MockCoupon) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const t = useT();
  const types: { id: CouponType; label: string }[] = [
    { id: "percent", label: t("admin.coupons.typePercent", "אחוזי הנחה") },
    { id: "fixed", label: t("admin.coupons.typeFixed", "סכום הנחה") },
    {
      id: "free_delivery",
      label: t("admin.coupons.typeFreeDelivery", "משלוח חינם"),
    },
  ];
  const inputBase =
    "h-10 w-full rounded-xl border border-[#ECE9E4] bg-white px-3 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-ds-primary";

  return (
    <div className="admin-card space-y-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-[#1A1A1A]">
          {t("admin.coupons.editTitle", "פרטי קופון")}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#777] hover:bg-[#F8F7F5]"
          aria-label={t("common.close", "סגור")}
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[#555]">
            {t("admin.coupons.code", "קוד")}
          </span>
          <input
            dir="ltr"
            value={coupon.code}
            onChange={(e) => onChange({ ...coupon, code: e.target.value })}
            className={`${inputBase} font-mono uppercase`}
            placeholder="WELCOME10"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[#555]">
            {t("admin.coupons.type", "סוג")}
          </span>
          <select
            value={coupon.type}
            onChange={(e) =>
              onChange({ ...coupon, type: e.target.value as CouponType })
            }
            className={inputBase}
          >
            {types.map((t2) => (
              <option key={t2.id} value={t2.id}>
                {t2.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-xs font-medium text-[#555]">
            {t("admin.coupons.description", "תיאור")}
          </span>
          <input
            value={coupon.description}
            onChange={(e) => onChange({ ...coupon, description: e.target.value })}
            className={inputBase}
            placeholder={t(
              "admin.coupons.descriptionHint",
              "לדוגמה: 10% על ההזמנה הראשונה"
            )}
          />
        </label>

        {coupon.type !== "free_delivery" && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#555]">
              {coupon.type === "percent"
                ? t("admin.coupons.percent", "אחוז הנחה")
                : t("admin.coupons.amount", "סכום הנחה (₪)")}
            </span>
            <input
              type="number"
              min={0}
              value={coupon.value}
              onChange={(e) =>
                onChange({ ...coupon, value: Number(e.target.value) || 0 })
              }
              className={inputBase}
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[#555]">
            {t("admin.coupons.minOrder", "מינימום הזמנה (₪)")}
          </span>
          <input
            type="number"
            min={0}
            value={coupon.minOrder ?? 0}
            onChange={(e) =>
              onChange({ ...coupon, minOrder: Number(e.target.value) || 0 })
            }
            className={inputBase}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[#555]">
            {t("admin.coupons.maxUses", "שימושים מקסימליים")}
          </span>
          <input
            type="number"
            min={0}
            value={coupon.maxUses ?? ""}
            onChange={(e) =>
              onChange({
                ...coupon,
                maxUses: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={inputBase}
            placeholder={t("admin.coupons.unlimited", "ללא הגבלה")}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[#555]">
            {t("admin.coupons.expires", "תאריך תפוגה")}
          </span>
          <input
            type="date"
            value={coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : ""}
            onChange={(e) =>
              onChange({
                ...coupon,
                expiresAt: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              })
            }
            className={inputBase}
          />
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={coupon.active}
            onChange={(e) => onChange({ ...coupon, active: e.target.checked })}
            className="h-4 w-4 rounded border-[#ECE9E4] text-ds-primary focus:ring-ds-primary"
          />
          <span className="text-sm text-[#1A1A1A]">
            {t("admin.coupons.statusActive", "פעיל")}
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-xl border border-[#ECE9E4] bg-white px-4 text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-[#F8F7F5]"
        >
          {t("common.cancel", "ביטול")}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ds-primary px-4 text-sm font-medium text-ds-text-on-primary transition-colors hover:bg-ds-primary-hover"
        >
          <Save className="h-4 w-4" strokeWidth={1.75} />
          {t("common.save", "שמור")}
        </button>
      </div>
    </div>
  );
}
