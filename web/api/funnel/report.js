/**
 * Funnel rollup JSON · Bearer CRON_SECRET or SPT_CRON_SECRET.
 */
import { buildFunnelReport } from "../../lib/funnel-rollups.mjs";

function cronAuthorized(req) {
  const secret = process.env.SPT_CRON_SECRET || process.env.CRON_SECRET || "";
  if (!secret) return false;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === secret;
}

export default async function handler(req, res) {
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
