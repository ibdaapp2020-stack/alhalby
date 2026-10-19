import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

let adminApp: App | undefined;

type ServiceAccountJson = {
  project_id: string;
  client_email: string;
  private_key: string;
};

/**
 * Try reading a local service-account JSON file as a dev-only fallback.
 *
 * Resolution order:
 *   1. GOOGLE_APPLICATION_CREDENTIALS (standard Google SDK convention)
 *   2. .firebase-admin-key.json in the current working directory
 *
 * The file is gitignored so this never activates in production builds —
 * Vercel/CI do not ship the file. Returns null if nothing usable is found,
 * letting the main resolver throw a helpful error.
 */
function readServiceAccountFromDisk(): ServiceAccountJson | null {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    resolve(process.cwd(), ".firebase-admin-key.json"),
  ].filter((p): p is string => typeof p === "string" && p.length > 0);

  for (const path of candidates) {
    try {
      if (!existsSync(path)) continue;
      const raw = readFileSync(path, "utf8");
      const parsed = JSON.parse(raw) as ServiceAccountJson;
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        // Dev-only log so the credential source is visible in the terminal.
        if (process.env.NODE_ENV !== "production") {
          console.info(`[firebase-admin] using service account from ${path}`);
        }
        return parsed;
      }
    } catch (err) {
      console.warn(
        `[firebase-admin] failed to read service account from ${path}:`,
        err instanceof Error ? err.message : err
      );
    }
  }
  return null;
}

function getServiceAccount(): ServiceAccountJson {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return JSON.parse(json) as ServiceAccountJson;
  }

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    if (!privateKey.includes("BEGIN PRIVATE KEY")) {
      throw new Error(
        "FIREBASE_ADMIN_PRIVATE_KEY must be the PEM private key from Firebase Console → Project Settings → Service Accounts → Generate new private key. It is NOT your login password. The key starts with -----BEGIN PRIVATE KEY-----"
      );
    }
    return { project_id: projectId, client_email: clientEmail, private_key: privateKey };
  }

  // Dev convenience: fall back to a gitignored service-account file on disk.
  const fromDisk = readServiceAccountFromDisk();
  if (fromDisk) return fromDisk;

  throw new Error(
    "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON, " +
      "or FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY, " +
      "or place a service account JSON at .firebase-admin-key.json in the repo root."
  );
}

export function getAdminApp(): App {
  if (!adminApp) {
    const existing = getApps();
    if (existing.length > 0) {
      adminApp = existing[0]!;
    } else {
      const sa = getServiceAccount();
      adminApp = initializeApp({
        credential: cert({
          projectId: sa.project_id,
          clientEmail: sa.client_email,
          privateKey: sa.private_key,
        }),
      });
    }
  }
  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export async function verifyIdToken(token: string) {
  return getAdminAuth().verifyIdToken(token);
}
