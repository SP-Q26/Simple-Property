import Stripe from "stripe";
import { catalogForSku, siteOrigin } from "../../lib/stripe-catalog.mjs";
import { PRO_UNITS_MAX } from "../../lib/pro-limits.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

function normalizeSku(raw) {
  return raw === "annual" ? "annual" : "monthly";
}

function priceEnvKey(sku) {
  return sku === "annual" ? "STRIPE_PRICE_ANNUAL" : "STRIPE_PRICE_MONTHLY";
}

function lineItemForSku(sku) {
  const catalog = catalogForSku(sku);
  const priceId = process.env[priceEnvKey(sku)];
  if (priceId) {
    return { price: priceId, quantity: 1 };
  }
  const priceData = {
    currency: catalog.currency,
    product_data: {
      name: catalog.name,
      description: catalog.description,
      metadata: catalog.metadata,
    },
    unit_amount: catalog.unit_amount,
    recurring: catalog.recurring,
  };
  return { price_data: priceData, quantity: 1 };
}

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

  const sku = normalizeSku(body?.sku);
  const catalog = catalogForSku(sku);
  const origin = siteOrigin();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: catalog.mode,
      line_items: [lineItemForSku(sku)],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${sku}`,
      cancel_url: `${origin}/pricing`,
      metadata: { spt_sku: sku, spt_plan: "pro", spt_units_max: String(PRO_UNITS_MAX) },
      subscription_data: {
        metadata: { spt_sku: sku, spt_plan: "pro", spt_units_max: String(PRO_UNITS_MAX) },
      },
      allow_promotion_codes: true,
      custom_text: {
        submit: {
          message:
            "Documentation tool only · not legal advice. Cancel anytime in Stripe Customer Portal.",
        },
      },
    });
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("spt checkout", e);
    return res.status(500).json({ error: "checkout_failed" });
  }
}
