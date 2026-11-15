import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore-data";
import type { MockCoupon, CouponType } from "@/lib/mock-data/coupons";

const TYPES: readonly CouponType[] = ["percent", "fixed", "free_delivery"];

export function couponDocumentId(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 40);
}

function asCoupon(id: string, data: Record<string, unknown>): MockCoupon {
  const type = TYPES.includes(data.type as CouponType) ? (data.type as CouponType) : "percent";
  const maxUses = typeof data.maxUses === "number" ? data.maxUses : null;
  return {
    id,
    code: typeof data.code === "string" && data.code ? data.code : id,
    description: typeof data.description === "string" ? data.description : "",
    type,
    value: typeof data.value === "number" ? data.value : 0,
    minOrder: typeof data.minOrder === "number" ? data.minOrder : 0,
    expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : null,
    maxUses,
    uses: typeof data.uses === "number" ? data.uses : 0,
    active: data.active !== false,
  };
}

export function subscribeToCoupons(
  onData: (coupons: MockCoupon[]) => void,
  onError: (error: string) => void
): Unsubscribe {
  const db = getDb();
  return onSnapshot(
    collection(db, COLLECTIONS.coupons),
    (snapshot) => {
      onData(snapshot.docs.map((item) => asCoupon(item.id, item.data())).sort((a, b) => a.code.localeCompare(b.code)));
    },
    (error) => onError(error.message)
  );
}

export async function saveCoupon(coupon: MockCoupon): Promise<void> {
  const id = couponDocumentId(coupon.code);
  if (!id) throw new Error("Coupon code is required");
  const db = getDb();
  await setDoc(doc(db, COLLECTIONS.coupons, id), sanitizeFirestoreData({
    code: id,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    minOrder: coupon.minOrder ?? 0,
    expiresAt: coupon.expiresAt ?? null,
    maxUses: coupon.maxUses ?? null,
    uses: coupon.uses ?? 0,
    active: coupon.active,
  }));
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.coupons, id));
}

/** One active coupon by its code. A missing or inactive code is not a discount. */
export async function findActiveCoupon(code: string): Promise<MockCoupon | null> {
  const id = couponDocumentId(code);
  if (!id) return null;
  try {
    const snap = await getDoc(doc(getDb(), COLLECTIONS.coupons, id));
    if (!snap.exists()) return null;
    const coupon = asCoupon(snap.id, snap.data());
    if (!coupon.active) return null;
    if (coupon.expiresAt && Date.parse(coupon.expiresAt) < Date.now()) return null;
    if (coupon.maxUses != null && coupon.uses >= coupon.maxUses) return null;
    return coupon;
  } catch {
    return null;
  }
}
