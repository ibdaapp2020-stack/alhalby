/**
 * Mock admin user — a single Admin account for local development.
 *
 * ⚠️ Not for production use. The password is validated in plain text by
 * the mock auth provider for demonstration only. When wiring a real
 * backend (Firebase / Supabase / custom), replace this file with a
 * secure authentication flow.
 */
import type { UserRole } from "@/lib/auth/roles";

export interface MockUser {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  active: boolean;
}

export const MOCK_ADMIN_USER: MockUser = {
  uid: "mock-admin",
  email: "admin@alhalabi.com",
  password: "Halabi1234",
  displayName: "מנהל אלחלבי",
  role: "Admin",
  active: true,
};

export const mockUsers: MockUser[] = [MOCK_ADMIN_USER];
