/**
 * Weekly funnel log line for Vercel cron · same data as GET /api/funnel/report.
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
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!cronAuthorized(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const report = await buildFunnelReport(7);
  console.log(JSON.stringify({ spt_funnel_weekly: true, report }));
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ok: true, report });
}
