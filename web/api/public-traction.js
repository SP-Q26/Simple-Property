import traction from "../data/public-traction.json" with { type: "json" };

/** Public marketing traction floors (from tracked usage · not live PII). */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json(traction);
}
