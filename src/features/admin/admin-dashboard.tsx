"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Package,
  ClipboardList,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  Flame,
  ArrowRight,
  Tags,
  Settings,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import { useProducts, useAllCategories } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useOrders } from "@/hooks/useOrders";
import { useSettings } from "@/hooks/useSettings";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale, useT } from "@/components/providers/locale-provider";
import { useAdminPath } from "@/hooks/useAdminPath";
import { displayStoreName, getStoreImageSrc } from "@/lib/brand";
import { normalizeImageUrl } from "@/lib/menu/placeholders";
import { isDecorativeHeroImage } from "@/features/catalog/brand-hero-panel";
import { getCategoryDisplayName } from "@/lib/i18n/localized-content";
import type { OrderStatus, Order } from "@/types";

type RangeKey = "today" | "week" | "month" | "yesterday";

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "ready"];

/**
 * IBDA Store Base — admin dashboard.
 *
 * Shawarma-Amir-inspired layout:
 *   • Low wide hero banner greeting the operator.
 *   • Six KPI tiles (today's orders, pending, preparing, completed, today's
 *     sales, customers).
 *   • Sales area chart.
 *   • Recent orders table + popular products list side by side.
 *   • Categories grid at the bottom. No stock / inventory UI anywhere.
 */
export function AdminDashboard() {
  const t = useT();
  const { locale, dir } = useLocale();
  const adminPath = useAdminPath();
  const { settings } = useSettings();
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useAllCategories();
  const { customers, loading: customersLoading } = useCustomers();
  const { orders, loading: ordersLoading } = useOrders();

  const loading = productsLoading || customersLoading || ordersLoading || categoriesLoading;

  const todayStart = useMemo(() => startOfDay(new Date()).getTime(), []);
  const yesterdayStart = useMemo(
    () => todayStart - 1000 * 60 * 60 * 24,
    [todayStart]
  );
  const weekStart = useMemo(() => todayStart - 1000 * 60 * 60 * 24 * 6, [todayStart]);
  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }, []);

  const metrics = useMemo(() => {
    const parsed = orders.map((o) => ({ ...o, _ts: new Date(o.createdAt).getTime() }));
    const todayOrders = parsed.filter((o) => o._ts >= todayStart);
    const pendingOrders = parsed.filter((o) => o.status === "pending");
    const preparingOrders = parsed.filter((o) =>
      ["confirmed", "preparing"].includes(o.status)
    );
    const completedToday = todayOrders.filter((o) => o.status === "delivered");
    const activeOrders = parsed.filter((o) => ACTIVE_STATUSES.includes(o.status));
    const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);

    return {
      todayOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
      preparingOrders: preparingOrders.length,
      completedToday: completedToday.length,
      activeOrders: activeOrders.length,
      todaySales,
    };
  }, [orders, todayStart]);

  const chartData = useMemo<Array<{ day: string; sales: number }>>(() => {
    const bucket = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart - 1000 * 60 * 60 * 24 * i);
      const key = d.toISOString().slice(0, 10);
      bucket.set(key, 0);
    }
    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (bucket.has(key)) bucket.set(key, (bucket.get(key) ?? 0) + o.total);
    }
    return Array.from(bucket.entries()).map(([date, sales]) => ({
      day: new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
      sales,
    }));
  }, [orders, todayStart]);
  void weekStart;
  void monthStart;
  void yesterdayStart;

  const popularProducts = useMemo(() => {
    // Mock "sold" counter — count order items per product id.
    const counter = new Map<string, { name: string; count: number; revenue: number; image?: string }>();
    for (const o of orders) {
      for (const item of o.items ?? []) {
        const prev = counter.get(item.productId) ?? {
          name: item.productName,
          count: 0,
          revenue: 0,
          image: products.find((p) => p.id === item.productId)?.image,
        };
        prev.count += item.quantity;
        prev.revenue += item.price * item.quantity;
        counter.set(item.productId, prev);
      }
    }
    return Array.from(counter.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders, products]);

  const topCategories = useMemo(
    () =>
      categories.slice(0, 6).map((c) => ({
        id: c.id,
        name: getCategoryDisplayName(c, locale),
        image: c.image,
        count: products.filter((p) => p.categoryId === c.id).length,
      })),
    [categories, products, locale]
  );

  const heroImage = normalizeImageUrl(getStoreImageSrc(settings?.storeImageUrl));
  const showHeroPhoto = Boolean(heroImage) && !isDecorativeHeroImage(heroImage);

  const kpis = [
    {
      label: t("admin.dashboard.ordersToday", "הזמנות היום"),
      value: metrics.todayOrders,
      icon: ClipboardList,
      tint: "#6E2132",
    },
    {
      label: t("admin.dashboard.pending", "ממתינות"),
      value: metrics.pendingOrders,
      icon: Clock,
      tint: "#C9A35D",
    },
    {
      label: t("admin.dashboard.preparing", "בהכנה"),
      value: metrics.preparingOrders,
      icon: Flame,
      tint: "#D64242",
    },
    {
      label: t("admin.dashboard.completedToday", "הושלמו היום"),
      value: metrics.completedToday,
      icon: CheckCircle2,
      tint: "#1E9E6A",
    },
    {
      label: t("admin.dashboard.todaySales", "מכירות היום"),
      value: formatPrice(metrics.todaySales),
      icon: TrendingUp,
      tint: "#6E2132",
    },
    {
      label: t("admin.dashboard.customers", "לקוחות"),
      value: customers.length,
      icon: Users,
      tint: "#A89B68",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Hero banner ─── */}
      <section className="admin-card relative overflow-hidden">
        <div className="relative grid grid-cols-1 md:grid-cols-[1.3fr_1fr]">
          <div className="relative z-10 flex min-h-[140px] flex-col justify-center gap-2 p-5 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A89B68]">
              {t("admin.dashboard.welcome", "ברוכים הבאים")}
            </p>
            <h2 className="text-xl font-bold leading-tight text-[#6E2132] md:text-2xl">
              {displayStoreName(locale, settings?.storeName)}
            </h2>
            <p className="max-w-md text-sm text-[#555]">
              {t(
                "admin.dashboard.subtitle",
                "מבט מהיר על ההזמנות, המוצרים והלקוחות. השינויים נשמרים ל-MOCK DATA מקומי בלבד."
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href={adminPath("orders")}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ds-primary px-3.5 text-xs font-semibold text-ds-text-on-primary transition-colors hover:bg-ds-primary-hover"
              >
                <ClipboardList className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t("admin.dashboard.manageOrders", "ניהול הזמנות")}
              </Link>
              <Link
                href={adminPath("products")}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#ECE9E4] bg-white px-3.5 text-xs font-semibold text-[#1A1A1A] transition-colors hover:border-ds-primary hover:text-ds-primary"
              >
                <Package className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t("admin.dashboard.manageProducts", "ניהול מוצרים")}
              </Link>
              <Link
                href={adminPath("categories")}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E6D7C3] bg-white px-3.5 text-xs font-semibold text-[#3E2A1F] transition-colors hover:border-ds-primary hover:text-ds-primary"
              >
                <Tags className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t("admin.categories", "קטגוריות")}
              </Link>
              <Link
                href={adminPath("settings")}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E6D7C3] bg-white px-3.5 text-xs font-semibold text-[#3E2A1F] transition-colors hover:border-ds-primary hover:text-ds-primary"
              >
                <Settings className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t("admin.settings", "הגדרות")}
              </Link>
            </div>
          </div>
          {showHeroPhoto && heroImage ? (
            <div className="relative hidden min-h-[140px] md:block">
              <Image
                src={heroImage}
                alt=""
                fill
                unoptimized={heroImage.includes("firebasestorage")}
                className="object-cover opacity-90"
                sizes="(max-width: 768px) 0px, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#FFFCF7] rtl:bg-gradient-to-r" />
            </div>
          ) : null}
        </div>
      </section>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="admin-card flex items-center gap-3 p-4">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${kpi.tint}18`, color: kpi.tint }}
            >
              <kpi.icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="admin-kpi-label truncate">{kpi.label}</p>
              <p dir="ltr" className="admin-kpi-value text-start">{loading ? "…" : kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Sales chart ─── */}
      <section className="admin-card p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              {t("admin.dashboard.salesChart", "מכירות — 7 ימים אחרונים")}
            </h3>
            <p className="text-xs text-[#777]">
              {t("admin.dashboard.salesChartHint", "סכומי מכירה יומיים")}
            </p>
          </div>
          <Link
            href={adminPath("orders")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ds-primary hover:text-ds-primary-hover"
          >
            {t("admin.dashboard.viewAll", "להצגה מלאה")}
            <ArrowRight className="h-3 w-3 rtl:rotate-180" strokeWidth={2} />
          </Link>
        </div>
        <div className="h-56">
          {loading ? (
            <Skeleton className="h-full w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="dashSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-ds-primary)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-ds-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  reversed={dir === "rtl"}
                  tick={{ fontSize: 11, fill: "#777" }}
                  stroke="#ECE9E4"
                />
                <YAxis
                  orientation={dir === "rtl" ? "right" : "left"}
                  tick={{ fontSize: 11, fill: "#777" }}
                  stroke="#ECE9E4"
                />
                <Tooltip
                  formatter={(v) => formatPrice(Number(v))}
                  contentStyle={{
                    direction: "ltr",
                    textAlign: dir === "rtl" ? "right" : "left",
                    borderRadius: 12,
                    border: "1px solid #ECE9E4",
                    boxShadow: "0 6px 24px -8px rgba(16,14,12,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-ds-primary)"
                  fill="url(#dashSalesGrad)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ─── Recent orders + popular products ─── */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <RecentOrdersCard
          orders={orders}
          loading={loading}
          adminPathFn={adminPath}
        />
        <PopularProductsCard
          items={popularProducts}
          loading={loading}
        />
      </div>

      {/* ─── Categories grid ─── */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            {t("admin.dashboard.topCategories", "קטגוריות")}
          </h3>
          <Link
            href={adminPath("categories")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ds-primary hover:text-ds-primary-hover"
          >
            {t("admin.dashboard.manageCategories", "ניהול קטגוריות")}
            <ArrowRight className="h-3 w-3 rtl:rotate-180" strokeWidth={2} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))
            : topCategories.length === 0
              ? (
                <div className="admin-card col-span-full px-4 py-8 text-center text-sm text-[#777]">
                  {t("admin.dashboard.noCategories", "עוד אין קטגוריות")}
                </div>
              )
              : topCategories.map((c) => {
                  const img = normalizeImageUrl(c.image) || "/brand/category-generic.svg";
                  return (
                    <Link
                      key={c.id}
                      href={`${adminPath("products")}?category=${encodeURIComponent(c.id)}`}
                      className="admin-card group relative overflow-hidden text-start transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF9F6]">
                        <Image
                          src={img}
                          alt={c.name}
                          fill
                          unoptimized={img.includes("firebasestorage")}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 220px"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                          {c.name}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F8F7F5] px-2 py-0.5 text-[10px] font-semibold text-[#555]">
                          <Tags className="h-3 w-3" strokeWidth={1.75} />
                          {c.count}
                        </span>
                      </div>
                    </Link>
                  );
                })}
        </div>
      </section>

      {/* Dates reference-anchors (prevent unused-var warnings) */}
      <span className="hidden">{Calendar.name}</span>
    </div>
  );
}

function RecentOrdersCard({
  orders,
  loading,
  adminPathFn,
}: {
  orders: Order[];
  loading: boolean;
  adminPathFn: (seg: Parameters<typeof import("@/lib/domains/host-routing").adminPath>[0]) => string;
}) {
  const t = useT();
  const list = orders.slice(0, 6);

  const statusChip = (status: OrderStatus) => {
    const map: Record<OrderStatus, { bg: string; color: string }> = {
      pending: { bg: "rgba(242,163,65,0.15)", color: "#B46B10" },
      confirmed: { bg: "rgba(110,33,50,0.12)", color: "#6E2132" },
      preparing: { bg: "rgba(214,66,66,0.15)", color: "#B23232" },
      ready: { bg: "rgba(30,158,106,0.15)", color: "#157A4D" },
      delivered: { bg: "rgba(30,158,106,0.12)", color: "#157A4D" },
      cancelled: { bg: "rgba(119,119,119,0.15)", color: "#555" },
    };
    const style = map[status];
    return (
      <span className="admin-chip" style={{ backgroundColor: style.bg, color: style.color }}>
        {t(`admin.status.${status}`, status)}
      </span>
    );
  };

  return (
    <section className="admin-card overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-[#F0EDE7] px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            {t("admin.dashboard.recentOrders", "הזמנות אחרונות")}
          </h3>
        </div>
        <Link
          href={adminPathFn("orders")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ds-primary hover:text-ds-primary-hover"
        >
          {t("admin.dashboard.viewAll", "להצגה מלאה")}
          <ArrowRight className="h-3 w-3 rtl:rotate-180" strokeWidth={2} />
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-[#777]">
          {t("admin.dashboard.noOrders", "אין הזמנות עדיין")}
        </div>
      ) : (
        <div>
          {list.map((order) => (
            <div
              key={order.id}
              className="admin-table-row grid-cols-[auto_1fr_auto]"
            >
              <div className="min-w-0">
                <p dir="ltr" className="truncate text-start text-sm font-semibold text-[#1A1A1A]">
                  {order.orderNumber}
                </p>
                <p className="truncate text-xs text-[#777]">
                  {order.customerName}
                </p>
              </div>
              <div className="min-w-0 text-end">
                <p dir="ltr" className="text-start text-sm font-bold text-[#1A1A1A]">
                  {formatPrice(order.total)}
                </p>
                <p dir="ltr" className="truncate text-start text-[11px] text-[#777]">
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>{statusChip(order.status)}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PopularProductsCard({
  items,
  loading,
}: {
  items: Array<{ name: string; count: number; revenue: number; image?: string }>;
  loading: boolean;
}) {
  const t = useT();
  return (
    <section className="admin-card overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-[#F0EDE7] px-5 py-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          {t("admin.dashboard.popularProducts", "מוצרים פופולריים")}
        </h3>
      </div>
      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-[#777]">
          {t("admin.dashboard.noPopular", "עוד לא נמכרו מוצרים")}
        </div>
      ) : (
        <div>
          {items.map((item, idx) => (
            <div key={idx} className="admin-table-row grid-cols-[48px_1fr_auto]">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-[#F8F7F5]">
                {item.image ? (
                  <Image
                    src={normalizeImageUrl(item.image) || "/brand/product-placeholder.svg"}
                    alt={item.name}
                    fill
                    unoptimized={!!item.image?.includes("firebasestorage")}
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#555]">
                    <Package className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                  {item.name}
                </p>
                <p className="text-xs text-[#777]">
                  {item.count} {t("admin.dashboard.sold", "נמכרו")}
                </p>
              </div>
              <p dir="ltr" className="text-start text-sm font-bold text-[#1A1A1A]">
                {formatPrice(item.revenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Helper: typed admin-path signature for recent-orders card
void (undefined as unknown as RangeKey);
