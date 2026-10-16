/**
 * Read-only / light ops routes · single serverless fn via api/ops.js + rewrites (Hobby 12-fn cap).
 */
import { kvConfigured } from "./kv-client.mjs";
import { resendConfigured } from "./resend.mjs";
import { buildFunnelReport } from "./funnel-rollups.mjs";
import traction from "../data/public-traction.json" with { type: "json" };

function cronAuthorized(req) {
  const secret = process.env.SPT_CRON_SECRET || process.env.CRON_SECRET || "";
  if (!secret) return false;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === secret;
}

export function handleHealthServices(req, res) {
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
      funnel:
        "KV (Vercel Storage integration) · POST /api/events rollups · GET /api/funnel/report · cron /api/cron/funnel-weekly-report",
      docs: "https://github.com/SP-Q26/Simple-Property/blob/main/docs/VERCEL_SETUP.md",
    },
  });
}

export function handlePublicTraction(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json(traction);
}

export async function handleFunnelReport(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!cronAuthorized(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const days = Math.min(30, Math.max(1, parseInt(req.query?.days || "7", 10) || 7));
  const report = await buildFunnelReport(days);
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(report);
}

export async function dispatchOps(route, req, res) {
  switch (route) {
    case "health-services":
      return handleHealthServices(req, res);
    case "public-traction":
      return handlePublicTraction(req, res);
    case "funnel-report":
      return handleFunnelReport(req, res);
    default:
      return res.status(404).json({ error: "unknown_ops_route", route });
  }
}
