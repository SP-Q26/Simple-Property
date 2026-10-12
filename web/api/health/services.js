import { kvConfigured } from "../../lib/kv-client.mjs";
import { resendConfigured } from "../../lib/resend.mjs";

/** Public readiness probe · no secrets · for post-deploy smoke. */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  res.setHeader("Cache-Control", "no-store");
  const ready =
    resendConfigured() &&
    kvConfigured() &&
    Boolean(process.env.STRIPE_SECRET_KEY) &&
    Boolean(process.env.SPT_ENTITLEMENT_SECRET);
  return res.status(200).json({
    product: "Deposit Desk",
    ready,
    checks: {
      resend: resendConfigured(),
      kv: kvConfigured(),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      entitlementSecret: Boolean(process.env.SPT_ENTITLEMENT_SECRET),
      siteUrl: Boolean(process.env.SPT_SITE_URL),
      emailFrom: Boolean(process.env.SPT_EMAIL_FROM),
      cronAuth: Boolean(process.env.SPT_CRON_SECRET || process.env.CRON_SECRET),
    },
    hints: {
      reminders:
        "Needs resend + kv · POST /api/reminders/subscribe · cron /api/cron/deadline-reminders",
      docs: "https://github.com/SP-Q26/Simple-Property/blob/main/docs/VERCEL_SETUP.md",
    },
  });
}
