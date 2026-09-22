import { siteOrigin } from "./stripe-catalog.mjs";

export function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendResendEmail({ to, subject, text, html, bcc }) {
  if (!resendConfigured()) {
    return { ok: false, error: "resend_not_configured" };
  }
  const from = process.env.SPT_EMAIL_FROM || "Deposit Desk <hello@simpleproperty.tools>";
  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html: html || text.replace(/\n/g, "<br>"),
  };
  if (bcc?.length) payload.bcc = bcc;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("spt resend", res.status, err);
    return { ok: false, error: "send_failed" };
  }
  return { ok: true };
}

export async function sendMagicLinkEmail(to, token, sig) {
  const origin = siteOrigin();
  const url = `${origin}/app?magic=${encodeURIComponent(token)}&sig=${encodeURIComponent(sig)}`;
  const text = [
    "Restore Deposit Desk Pro on this device:",
    url,
    "",
    "Link expires in 15 minutes. Not legal advice.",
    " ·  Simple Property Tools",
  ].join("\n");
  return sendResendEmail({
    to,
    subject: "Your Deposit Desk Pro sign-in link",
    text,
  });
}

export async function sendDeadlineReminderEmail({ to, label, deadlineIso, daysLeft, jurisdiction }) {
  const law = jurisdiction ? String(jurisdiction).slice(0, 120) : "your state deadline rules";
  const text = [
    `Deposit deadline in ${daysLeft} day(s) · ${label || "Your rental"}`,
    `Return or itemize by ${deadlineIso} (${law}).`,
    "",
    "Open your packet: " + siteOrigin() + "/app",
    "",
    "Not legal advice · Simple Property Tools",
  ].join("\n");
  return sendResendEmail({
    to,
    subject: `Deposit deadline · ${daysLeft} days · ${label || "Deposit Desk"}`,
    text,
  });
}
