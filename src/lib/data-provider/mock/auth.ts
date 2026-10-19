/**
 * Mock authentication — localStorage-backed demo session.
 *
 * The admin login form validates email/password against {@link mockUsers}
 * and persists the authenticated session as a JSON blob in
 * `localStorage['store-mock-auth-user']`.
 *
 * ⚠️ Not a real authentication system. There are no tokens, no server-
 * side verification, no password hashing. This exists only so the admin
 * screens of the template behave normally during local demos. Replace
 * with a real auth provider (Firebase Auth, Clerk, Supabase Auth, etc.)
 * before shipping to production.
 */
import { mockUsers, MOCK_ADMIN_USER, type MockUser } from "@/lib/mock-data";

export interface MockAuthSession {
  uid: string;
  email: string;
  displayName: string;
  role: MockUser["role"];
}

const SESSION_STORAGE_KEY = "store-mock-auth-user";

type Listener = (session: MockAuthSession | null) => void;

const listeners = new Set<Listener>();

function readSession(): MockAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockAuthSession;
  } catch {
    return null;
  }
}

function writeSession(session: MockAuthSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
  for (const listener of listeners) listener(session);
}

export function getCurrentSession(): MockAuthSession | null {
  return readSession();
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  queueMicrotask(() => listener(readSession()));
  return () => {
    listeners.delete(listener);
  };
}

export async function signIn(
  email: string,
  password: string
): Promise<MockAuthSession> {
  const normalized = email.trim().toLowerCase();
  const found = mockUsers.find(
    (u) => u.email.toLowerCase() === normalized && u.password === password && u.active
  );
  if (!found) {
    throw new Error("Invalid email or password");
  }
  const session: MockAuthSession = {
    uid: found.uid,
    email: found.email,
    displayName: found.displayName,
    role: found.role,
  };
  writeSession(session);
  return session;
}

export async function signOut(): Promise<void> {
  writeSession(null);
}

export async function sendPasswordReset(_email: string): Promise<void> {
  // No-op in mock mode — password reset is not applicable.
}

export async function getIdToken(): Promise<string | null> {
  const session = readSession();
  if (!session) return null;
  // Non-cryptographic marker token so API routes can tell this came
  // from the mock session, not a real JWT.
  return `mock-token.${session.uid}`;
}

export { MOCK_ADMIN_USER };
