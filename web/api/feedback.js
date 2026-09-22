import { kvZadd, kvConfigured } from "../lib/kv-client.mjs";
import { resendConfigured, sendResendEmail } from "../lib/resend.mjs";
import { normalizeEmail } from "../lib/subscription-store.mjs";

const CATEGORIES = new Set(["ruleset", "feature", "wizard", "content", "other"]);
const MAX_MESSAGE = 4000;
const MAX_STATE = 80;

function sanitizeText(raw, max) {
  return String(raw || "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "invalid_json" });
    }
  }

  if (body?.website) {
    return res.status(200).json({ ok: true });
  }

  const category = sanitizeText(body?.category, 32);
  const message = sanitizeText(body?.message, MAX_MESSAGE);
  const state = sanitizeText(body?.state, MAX_STATE);
  const emailRaw = body?.email ? normalizeEmail(body.email) : "";
  const email = emailRaw.includes("@") ? emailRaw.slice(0, 120) : "";

  if (!CATEGORIES.has(category)) {
    return res.status(400).json({ error: "invalid_category" });
  }
  if (message.length < 12) {
    return res.status(400).json({ error: "message_too_short" });
  }

  const payload = {
    category,
    message,
    state: state || null,
    email: email || null,
    at: new Date().toISOString(),
  };

  const stored = kvConfigured()
    ? await kvZadd("spt:feedback", { score: Date.now(), member: JSON.stringify(payload) })
    : false;

  const to = process.env.SPT_FEEDBACK_TO || "hello@simple-property.com";
  let mailed = false;
  if (resendConfigured()) {
    const subject = `Deposit Desk feedback · ${category}`;
    const text = [
      `Category: ${category}`,
      state ? `State/city: ${state}` : null,
      email ? `Reply-to: ${email}` : null,
      "",
      message,
      "",
      " ·  Simple Property Tools",
    ]
      .filter(Boolean)
      .join("\n");
    const result = await sendResendEmail({
      to,
      subject,
      text,
      ...(email ? { bcc: undefined } : {}),
    });
    mailed = result.ok;
  }

  if (!stored && !mailed) {
    return res.status(503).json({
      error: "feedback_unavailable",
      hint: "mailto:hello@simple-property.com?subject=Deposit%20Desk%20feedback",
    });
  }

  return res.status(200).json({ ok: true, stored: Boolean(stored), emailed: mailed });
}
