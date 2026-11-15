/**
 * Mock coupons / promotions — purely illustrative data used by the admin
 * when the project runs in mock mode. The admin "Coupons" page edits a
 * copy stored in `localStorage` so operators can try out the flow without
 * a backend.
 */

export type CouponType = "percent" | "fixed" | "free_delivery";

export interface MockCoupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  /** Percent (0–100) when type === "percent", amount when type === "fixed". */
  value: number;
  /** Minimum order total required for the coupon to apply (ILS). */
  minOrder?: number;
  /** ISO date — expiration (optional). */
  expiresAt?: string | null;
  /** Max total uses across all customers. */
  maxUses?: number | null;
  /** Current usage counter. */
  uses: number;
  active: boolean;
}

export const mockCoupons: MockCoupon[] = [
  {
    id: "cp-welcome10",
    code: "WELCOME10",
    description: "הנחת ברוכים הבאים — 10% על ההזמנה הראשונה",
    type: "percent",
    value: 10,
    minOrder: 50,
    expiresAt: null,
    maxUses: null,
    uses: 24,
    active: true,
  },
  {
    id: "cp-free-delivery",
    code: "FREESHIP",
    description: "משלוח חינם מעל 120₪",
    type: "free_delivery",
    value: 0,
    minOrder: 120,
    expiresAt: null,
    maxUses: null,
    uses: 48,
    active: true,
  },
  {
    id: "cp-happy25",
    code: "HAPPY25",
    description: "25₪ הנחה — חגיגת השקה",
    type: "fixed",
    value: 25,
    minOrder: 80,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    maxUses: 200,
    uses: 73,
    active: true,
  },
  {
    id: "cp-ramadan",
    code: "RAMADAN20",
    description: "מבצע עונתי — 20% הנחה (לא פעיל)",
    type: "percent",
    value: 20,
    minOrder: 0,
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    maxUses: null,
    uses: 310,
    active: false,
  },
];
