import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Public marketing traction floors (from tracked usage · not live PII). */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  try {
    const raw = readFileSync(join(process.cwd(), "data", "public-traction.json"), "utf8");
    const data = JSON.parse(raw);
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch {
    return res.status(503).json({ error: "unavailable" });
  }
}
