/**
 * Client telemetry sink · Vercel logs + optional KV funnel rollups.
 * No PII storage · receipt ids must arrive hashed from client.
 */
import { recordFunnelEvent } from "../lib/funnel-rollups.mjs";

const PII_KEY_RE =
  /(email|e_mail|address|street|tenant|landlord|phone|zip|name|mail|recipient)/i;

function scrub(obj) {
  if (!obj || typeof obj !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (PII_KEY_RE.test(k) || k === "receipt_id") continue;
    if (typeof v === "string" && v.includes("@")) continue;
    out[k] = v;
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }
  let body = {};
  try {
    const raw = await readBody(req);
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const name = String(body.name || "").slice(0, 80);
  const data = scrub(body.data || {});
  if (!name) {
    return res.status(400).json({ error: "missing_name" });
  }

  console.log(
    JSON.stringify({
      spt_telemetry: true,
      name,
      data,
      path: String(body.path || "").slice(0, 200),
      at: new Date().toISOString(),
    })
  );

  try {
    await recordFunnelEvent(name, data);
  } catch (e) {
    console.error("spt funnel rollup", name, e.message);
  }

  return res.status(204).end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
