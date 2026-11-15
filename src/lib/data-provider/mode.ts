/**
 * Data provider selection.
 *
 * The store template ships with two providers:
 *  - **mock**     — in-memory + localStorage, no external services. Default.
 *  - **firebase** — Firestore + Firebase Auth (opt-in, requires env vars).
 *
 * Resolution order:
 *  1. Explicit opt-in via `NEXT_PUBLIC_DATA_PROVIDER=mock|firebase`.
 *  2. Auto-detect: use `firebase` if the required `NEXT_PUBLIC_FIREBASE_*`
 *     env vars are all present, otherwise fall back to `mock`.
 *
 * This file is the single source of truth consumed by services, providers,
 * and API routes. **Do not** read `process.env.NEXT_PUBLIC_DATA_PROVIDER`
 * directly elsewhere.
 */

export type DataProviderMode = "mock" | "firebase";

const REQUIRED_FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

function readFirebaseEnvMap(): Record<string, string | undefined> {
  // Static reads so Next.js inlines the values at build time.
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function hasFirebaseEnvConfigured(): boolean {
  const env = readFirebaseEnvMap();
  return REQUIRED_FIREBASE_ENV_KEYS.every((key) => Boolean(env[key]?.trim()));
}

function resolveMode(): DataProviderMode {
  const explicit = process.env.NEXT_PUBLIC_DATA_PROVIDER?.toLowerCase().trim();
  if (explicit === "mock" || explicit === "demo" || explicit === "local") return "mock";
  // Firebase is only usable when the public keys are actually filled in.
  // An explicit "firebase" value with empty keys cannot reach a server.
  if (!hasFirebaseEnvConfigured()) return "mock";
  return "firebase";
}

/** Resolved once at module load. Safe to cache — env is static. */
export const DATA_PROVIDER_MODE: DataProviderMode = resolveMode();

export function isMockMode(): boolean {
  return DATA_PROVIDER_MODE === "mock";
}

export function isFirebaseMode(): boolean {
  return DATA_PROVIDER_MODE === "firebase";
}

export function getDataProviderMode(): DataProviderMode {
  return DATA_PROVIDER_MODE;
}
