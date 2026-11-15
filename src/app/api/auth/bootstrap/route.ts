import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { FieldValue } from "firebase-admin/firestore";
import { isMockMode } from "@/lib/data-provider/mode";

export async function POST() {
  // In mock mode there is no Firebase Admin SDK to touch. The mock admin
  // user lives in `src/lib/mock-data/users.ts` and is validated client-side.
  // Return a success response so the client-side bootstrap-on-mount call
  // doesn't log a scary 500 in the dev console.
  if (isMockMode()) {
    return Response.json({ bootstrapped: true, created: false, mode: "mock" });
  }

  try {
    const db = getAdminDb();
    const auth = getAdminAuth();

    const admins = await db
      .collection(COLLECTIONS.users)
      .where("role", "==", "Admin")
      .limit(1)
      .get();

    if (!admins.empty) {
      return Response.json({ bootstrapped: true, created: false });
    }

    const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim() ?? "";
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "";
    const displayName =
      process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "מנהל אלחלבי";
    // No default account. A short or demo password must never become a production admin.
    if (!email || password.length < 12 || password === "Halabi1234") {
      return Response.json({ bootstrapped: false, created: false, configured: false });
    }

    let uid: string;
    try {
      const existing = await auth.getUserByEmail(email);
      uid = existing.uid;
    } catch {
      const created = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });
      uid = created.uid;
    }

    await db.collection(COLLECTIONS.users).doc(uid).set({
      email,
      displayName,
      role: "Admin",
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return Response.json({
      bootstrapped: true,
      created: true,
      email,
      message: "Admin user created. Change password after first login.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bootstrap failed";
    // Log server-side so a 500 isn't silent in dev or prod logs.
    console.error("[api/auth/bootstrap] failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
