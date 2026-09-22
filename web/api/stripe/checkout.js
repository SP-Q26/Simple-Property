import Stripe from "stripe";
import {
  catalogForSku,
  isTurnSku,
  normalizeCheckoutSku,
  priceEnvKeyForSku,
  siteOrigin,
} from "../../lib/stripe-catalog.mjs";
import { PRO_UNITS_MAX } from "../../lib/pro-limits.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

function lineItemForSku(sku) {
  const catalog = catalogForSku(sku);
  const priceId = process.env[priceEnvKeyForSku(sku)];
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
  };
  if (catalog.recurring) {
    priceData.recurring = catalog.recurring;
  }
  return { price_data: priceData, quantity: 1 };
}

function sanitizePacketId(raw) {
  const s = String(raw || "").trim();
  if (s.length < 8 || s.length > 64) return "";
  if (!/^[a-zA-Z0-9_-]+$/.test(s)) return "";
  return s;
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

  const sku = normalizeCheckoutSku(body?.sku);
  const catalog = catalogForSku(sku);
  const origin = siteOrigin();
  const packetId = sanitizePacketId(body?.packet_id);

  if (isTurnSku(sku) && !packetId) {
    return res.status(400).json({ error: "packet_id_required" });
  }

  const metadata = {
    spt_sku: sku,
    spt_plan: catalog.metadata?.spt_plan || "pro",
    spt_units_max: String(PRO_UNITS_MAX),
    spt_payer: "landlord",
  };
  if (packetId) metadata.spt_packet_id = packetId;

  const successParams = new URLSearchParams({ session_id: "{CHECKOUT_SESSION_ID}", plan: sku });
  if (packetId) successParams.set("packet_id", packetId);

  const cancelUrl = isTurnSku(sku) ? `${origin}/app` : `${origin}/pricing`;

  try {
    const sessionParams = {
      mode: catalog.mode,
      line_items: [lineItemForSku(sku)],
      success_url: `${origin}/success?${successParams.toString()}`,
      cancel_url: cancelUrl,
      metadata,
      allow_promotion_codes: !isTurnSku(sku),
      custom_text: {
        submit: {
          message: isTurnSku(sku)
            ? "Documentation tool only · not legal advice. Unlocks print/PDF for this packet in your browser."
            : "Documentation tool only · not legal advice. Cancel anytime in Stripe Customer Portal.",
        },
      },
    };

    if (catalog.mode === "subscription") {
      sessionParams.subscription_data = {
        metadata: { ...metadata, spt_plan: "pro" },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("spt checkout", e);
    return res.status(500).json({ error: "checkout_failed" });
  }
}
