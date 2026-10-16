import { dispatchOps } from "../lib/ops-routes.mjs";

/**
 * Consolidated read-only ops · public URLs via vercel.json rewrites.
 * /api/health/services · /api/public-traction · /api/funnel/report
 */
export default async function handler(req, res) {
  const route = String(req.query?.route || "").trim();
  return dispatchOps(route, req, res);
}
