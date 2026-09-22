import Stripe from "stripe";
import { siteOrigin } from "../../lib/stripe-catalog.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "stripe_not_configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "invalid_json" });
    }
  }

  const customerId = body?.customer_id;
  if (!customerId || !String(customerId).startsWith("cus_")) {
    return res.status(400).json({ error: "missing_customer_id" });
  }

  try {
    const origin = siteOrigin();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/pricing`,
    });
    return res.status(200).json({ url: portal.url });
  } catch (e) {
    console.error("spt portal", e);
    return res.status(500).json({ error: "portal_failed" });
  }
}
