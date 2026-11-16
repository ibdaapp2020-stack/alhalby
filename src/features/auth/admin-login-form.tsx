"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeAdminReturnPath } from "@/lib/domains/host-routing";
import { useAdminPath } from "@/hooks/useAdminPath";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Info } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/brand/logo";
import { BRAND, displayStoreName } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale, useT } from "@/components/providers/locale-provider";
import { isMockMode } from "@/lib/data-provider/mode";
import { MOCK_ADMIN_USER } from "@/lib/mock-data";

export function AdminLoginForm() {
  const t = useT();
  const { locale } = useLocale();
  const storeName = displayStoreName(locale, BRAND.name);
  const { login, resetPassword, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminPath = useAdminPath();
  const [email, setEmail] = useState(isMockMode() ? MOCK_ADMIN_USER.email : "");
  const [password, setPassword] = useState(isMockMode() ? MOCK_ADMIN_USER.password : "");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const afterLoginPath = safeAdminReturnPath(
    searchParams.get("returnTo"),
    adminPath("")
  );

  if (!authLoading && user) {
    router.replace(afterLoginPath);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password, remember);
      router.replace(afterLoginPath);
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      const message = err instanceof Error ? err.message : "";
      if (
        code.includes("invalid-credential") ||
        code.includes("wrong-password") ||
        code.includes("user-not-found") ||
        code.includes("invalid-email")
      ) {
        setError(t("admin.loginFailed"));
      } else if (message.includes("profile not found") || message.includes("inactive")) {
        setError(t("admin.profileMissing"));
      } else {
        setError(message || t("error.generic"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      setError(t("validation.email"));
      return;
    }
    try {
      await resetPassword(email);
      setResetSent(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#6E2132] lg:flex">
        <div aria-hidden className="absolute -top-24 -start-16 h-72 w-72 rounded-full bg-[#C9A35D]/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-20 end-0 h-64 w-64 rounded-full bg-black/20 blur-3xl" />
        <div className="relative z-10 flex max-w-sm flex-col items-center px-10 text-center">
          <Logo size="xl" href={null} className="h-48 w-auto" />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 font-display text-4xl font-bold text-[#F8F3EA]"
          >
            {storeName}
          </motion.h1>
          <p className="mt-3 text-[#EFE4D1]">{BRAND.tagline}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-cream px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex flex-col items-center lg:items-start">
            <Logo size="lg" href={null} className="h-14 w-auto" />
            <h2 className="mt-4 font-display text-2xl font-bold text-dark-brown">
              {t("admin.welcome")}
            </h2>
            <p className="text-sm text-coffee/60">{t("admin.signInHint")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-warm-white p-6 shadow-elevated">
            <div>
              <Label htmlFor="email">{t("admin.email")}</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@alhalabi.com"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">{t("admin.password")}</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  dir="ltr"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 end-3 -translate-y-1/2 text-coffee/40"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-coffee/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded"
                />
                {t("admin.rememberMe")}
              </label>
              <button
                type="button"
                onClick={handleForgot}
                className="text-sm font-medium text-turquoise hover:underline"
              >
                {t("admin.forgotPassword")}
              </button>
            </div>

            {resetSent && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {t("common.success")}
              </p>
            )}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.signIn")}
            </Button>
          </form>
          {isMockMode() ? (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Demo credentials</p>
                <p>
                  Email:{" "}
                  <code className="font-mono">{MOCK_ADMIN_USER.email}</code>
                  <br />
                  Password:{" "}
                  <code className="font-mono">{MOCK_ADMIN_USER.password}</code>
                </p>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
