import { TRPCError } from "@trpc/server";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

/**
 * Dispatches a project-owner notification by email through Resend
 * (https://resend.com). Configuration:
 *
 *   RESEND_API_KEY    (required to send) Resend API key
 *   NOTIFY_EMAIL_TO   recipient(s), comma-separated. Falls back to OWNER_EMAIL.
 *   NOTIFY_EMAIL_FROM verified sender, e.g. "The Tax Firm <notify@thetaxfirm.us>".
 *                     Falls back to "onboarding@resend.dev" for first-run testing.
 *
 * Returns `true` when the email was accepted, `false` when notifications are not
 * configured or the upstream call fails. Callers treat a `false` result as a
 * soft failure (the underlying action still succeeds). Validation errors on the
 * payload itself bubble up as TRPC errors so callers can fix them.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.NOTIFY_EMAIL_TO || process.env.OWNER_EMAIL || "")
    .split(",")
    .map((addr) => addr.trim())
    .filter(Boolean);
  const from =
    process.env.NOTIFY_EMAIL_FROM || "The Tax Firm <onboarding@resend.dev>";

  if (!apiKey || to.length === 0) {
    console.warn(
      "[Notification] Skipped: set RESEND_API_KEY and NOTIFY_EMAIL_TO (or OWNER_EMAIL) to enable owner notifications."
    );
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: title,
        text: content,
        html: `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6"><h2 style="margin:0 0 12px">${escapeHtml(
          title
        )}</h2><pre style="white-space:pre-wrap;font-family:inherit;margin:0">${escapeHtml(
          content
        )}</pre></div>`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to send owner email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Notification] Error calling email service:", error);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
