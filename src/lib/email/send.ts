import { sendViaBrevo } from "@/lib/email/brevo";
import {
  getBrevoConfig,
  getBusinessAlertRecipients,
  getStoreNotificationEmails,
} from "@/lib/email/config";
import {
  renderCriticalCheckoutFailureEmail,
  renderNewOrderEmail,
  renderOrderCancelledEmail,
  renderOrderUpdatedEmail,
  renderTestEmailHtml,
  type OrderEmailBase,
} from "@/lib/email/templates";
import type { OrderChange } from "@/lib/email/significant-diff";
import type { StoreEmailKind, SendEmailResult } from "@/lib/email/types";

export type SendStoreEmailOptions = {
  to?: string | string[];
  subject: string;
  html: string;
  text?: string;
  kind?: StoreEmailKind;
};

/**
 * Central email entry-point for order and system notifications.
 * Always server-side. Never throw secrets.
 *
 * Brand name, sender, and recipients are all pulled from environment vars
 * (BREVO_SENDER_NAME, STORE_NOTIFICATION_EMAIL, STORE_ADMIN_EMAIL) so the
 * email surface is tenant-neutral.
 */
export async function sendStoreEmail(
  options: SendStoreEmailOptions
): Promise<SendEmailResult> {
  const defaultRecipients = getBusinessAlertRecipients();
  const to = options.to ?? defaultRecipients;

  const result = await sendViaBrevo({
    to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    tags: options.kind ? [`store`, options.kind] : ["store"],
  });

  if (!result.ok) {
    console.error("[email] Email notification failed", {
      kind: options.kind ?? "unknown",
      error: result.error,
      statusCode: result.statusCode,
      code: result.code,
      senderName: getBrevoConfig().senderName,
    });
  }

  return result;
}

export async function sendStoreTestEmail(
  to?: string | string[]
): Promise<SendEmailResult & { recipients: string[] }> {
  const recipients = to
    ? (Array.isArray(to) ? to : [to]).map((e) => e.trim()).filter(Boolean)
    : getStoreNotificationEmails().recipients;
  const content = renderTestEmailHtml();
  const result = await sendStoreEmail({
    to: recipients,
    subject: content.subject,
    html: content.html,
    text: content.text,
    kind: "test",
  });
  return { ...result, recipients };
}

export async function sendNewOrderNotificationEmail(
  payload: OrderEmailBase
): Promise<SendEmailResult> {
  const content = renderNewOrderEmail(payload);
  return sendStoreEmail({
    subject: content.subject,
    html: content.html,
    text: content.text,
    kind: "new_order",
  });
}

export async function sendOrderUpdatedNotificationEmail(
  payload: OrderEmailBase & { changes: OrderChange[] }
): Promise<SendEmailResult> {
  const content = renderOrderUpdatedEmail(payload);
  return sendStoreEmail({
    subject: content.subject,
    html: content.html,
    text: content.text,
    kind: "order_updated",
  });
}

export async function sendOrderCancelledNotificationEmail(
  payload: OrderEmailBase & { cancelReason?: string }
): Promise<SendEmailResult> {
  const content = renderOrderCancelledEmail(payload);
  return sendStoreEmail({
    subject: content.subject,
    html: content.html,
    text: content.text,
    kind: "order_cancelled",
  });
}

export async function sendCriticalCheckoutFailureEmail(payload: {
  message: string;
  code?: string;
  occurredAt: string;
}): Promise<SendEmailResult> {
  const content = renderCriticalCheckoutFailureEmail(payload);
  return sendStoreEmail({
    subject: content.subject,
    html: content.html,
    text: content.text,
    kind: "system",
  });
}

/** @deprecated Use {@link sendStoreEmail}. Alias retained for external scripts. */
export const sendMishkahEmail = sendStoreEmail;
/** @deprecated Use {@link sendStoreTestEmail}. */
export const sendMishkahTestEmail = sendStoreTestEmail;
