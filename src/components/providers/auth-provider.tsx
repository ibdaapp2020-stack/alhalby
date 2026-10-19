"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { UserRole } from "@/lib/auth/roles";
import { isMockMode } from "@/lib/data-provider/mode";
import { mockAuth } from "@/lib/data-provider/mock";

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchUserProfile(uid: string): Promise<AuthUser | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data.active) return null;
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role as UserRole,
  };
}

/** Mock-mode variant — mirrors the real AuthProvider contract. */
function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = mockAuth.subscribeSession((session) => {
      if (session) {
        setUser({
          uid: session.uid,
          email: session.email,
          displayName: session.displayName,
          role: session.role as UserRole,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(
    async (email: string, password: string, _remember = true) => {
      void _remember;
      const session = await mockAuth.signIn(email, password);
      setUser({
        uid: session.uid,
        email: session.email,
        displayName: session.displayName,
        role: session.role as UserRole,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    await mockAuth.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await mockAuth.sendPasswordReset(email);
  }, []);

  const getIdToken = useCallback(async () => {
    return mockAuth.getIdToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser: null,
        loading,
        login,
        logout,
        resetPassword,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Firebase-backed AuthProvider — original implementation. */
function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/bootstrap", { method: "POST" }).catch(() => {});

    let auth;
    try {
      auth = getFirebaseAuth();
    } catch (error) {
      // Firebase env is missing — don't crash the whole tree. Mark auth as
      // ready-but-anonymous and bail out of the subscription.
      console.warn("[AuthProvider] Firebase auth unavailable:", error);
      setLoading(false);
      return;
    }
    const authTimeout = window.setTimeout(() => {
      console.error("[AuthProvider] authentication state timed out");
      setLoading(false);
    }, 10_000);
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      window.clearTimeout(authTimeout);
      setFirebaseUser(fbUser);
      try {
        if (fbUser) {
          const profile = await fetchUserProfile(fbUser.uid);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("[AuthProvider] failed to load user profile", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => {
      window.clearTimeout(authTimeout);
      unsub();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      const auth = getFirebaseAuth();
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(cred.user.uid);
      if (!profile) {
        await signOut(auth);
        throw new Error("User profile not found or inactive");
      }
      setUser(profile);
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  }, []);

  const getIdToken = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, loading, login, logout, resetPassword, getIdToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (isMockMode()) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
