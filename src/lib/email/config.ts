/**
 * Server-side email configuration.
 *
 * Every string here is tenant-neutral: provider defaults, sender name, admin
 * recipients and portal URL are read from environment variables so cloning
 * this template never emails from the previous tenant's inbox.
 *
 * Never import this module from client components.
 */

export type MailProvider = "BREVO" | "NONE";

function env(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

export function getMailProvider(): MailProvider {
  const value = env("MAIL_PROVIDER", "NONE").toUpperCase();
  return value === "BREVO" ? "BREVO" : "NONE";
}

export function getBrevoConfig() {
  return {
    apiKey: env("BREVO_API_KEY"),
    baseUrl: env("BREVO_BASE_URL", "https://api.brevo.com/v3").replace(/\/$/, ""),
    senderName: env("BREVO_SENDER_NAME", "حلويات الحلبي"),
    senderEmail: env("BREVO_SENDER_EMAIL"),
    replyTo: env("BREVO_REPLY_TO"),
  };
}

/**
 * Notification recipients configured per-tenant via environment variables.
 * Returns an empty recipients array when neither var is set, so the sender
 * fails fast instead of silently emailing a leftover address.
 */
export function getStoreNotificationEmails() {
  const notification = env("STORE_NOTIFICATION_EMAIL");
  const admin = env("STORE_ADMIN_EMAIL");
  const recipients = [notification, admin].filter(Boolean);
  return {
    notification,
    admin,
    /** Unique list for broadcast / test emails */
    recipients: [...new Set(recipients)],
  };
}

/** Business order alerts — primary store inbox */
export function getBusinessAlertRecipients(): string[] {
  const { notification } = getStoreNotificationEmails();
  return notification ? [notification] : [];
}

export function getPublicSiteUrl(): string {
  return env("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, "");
}

export function getPortalAdminOrderUrl(orderId: string): string {
  const portalEnv = env("NEXT_PUBLIC_PORTAL_URL");
  const portalHost = env("NEXT_PUBLIC_PORTAL_HOST");
  const portal =
    portalEnv ||
    (portalHost ? `https://${portalHost}` : getPublicSiteUrl());
  const base = `${portal.replace(/\/$/, "")}/admin/orders`;
  return orderId ? `${base}?order=${encodeURIComponent(orderId)}` : base;
}

/** @deprecated Use {@link getStoreNotificationEmails}. Alias for scripts. */
export const getMishkahNotificationEmails = getStoreNotificationEmails;

export function assertBrevoReady(): { ok: true } | { ok: false; error: string } {
  if (getMailProvider() !== "BREVO") {
    return { ok: false, error: "MAIL_PROVIDER is not BREVO" };
  }
  const cfg = getBrevoConfig();
  if (!cfg.apiKey) {
    return { ok: false, error: "BREVO_API_KEY is missing" };
  }
  if (!cfg.senderEmail) {
    return { ok: false, error: "BREVO_SENDER_EMAIL is missing" };
  }
  if (!cfg.senderName) {
    return { ok: false, error: "BREVO_SENDER_NAME is missing" };
  }
  return { ok: true };
}
