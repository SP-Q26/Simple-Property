import { normalizeEmail } from "../../lib/subscription-store.mjs";
import { createMagicLinkForEmail } from "../../lib/magic-link.mjs";
import { sendMagicLinkEmail, resendConfigured } from "../../lib/resend.mjs";

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

  const email = normalizeEmail(body?.email);
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "invalid_email" });
  }

  // Same response whether or not account exists (no enumeration).
  const generic = {
    ok: true,
    message: "If Deposit Desk Pro is on that email, we sent a 15-minute link.",
  };

  if (!resendConfigured()) {
    return res.status(503).json({ error: "email_not_configured", ...generic });
  }

  try {
    const link = await createMagicLinkForEmail(email);
    if (link) {
      await sendMagicLinkEmail(email, link.token, link.sig);
    }
    return res.status(200).json(generic);
  } catch (e) {
    console.error("spt magic-link", e);
    return res.status(500).json({ error: "magic_failed" });
  }
}
