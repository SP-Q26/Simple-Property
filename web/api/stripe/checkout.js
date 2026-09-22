import Stripe from "stripe";
import {
  catalogForSku,
  isTurnSku,
  normalizeCheckoutSku,
  resolvePriceIdForSku,
  siteOrigin,
} from "../../lib/stripe-catalog.mjs";
import { PRO_UNITS_MAX } from "../../lib/pro-limits.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

function lineItemForSku(sku, opts = {}) {
  const catalog = catalogForSku(sku);
  const usePriceData = Boolean(opts.usePriceData);
  if (!usePriceData) {
    const priceId =
      opts.priceId ||
      resolvePriceIdForSku(sku, { forceCatalog: opts.forceCatalog }) ||
      (process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? catalog.live_price_id : "");
    if (priceId) {
      return { price: priceId, quantity: 1 };
    }
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

function buildBaseSessionParams({ sku, catalog, origin, metadata, packetId }) {
  const successParams = new URLSearchParams({ session_id: "{CHECKOUT_SESSION_ID}", plan: sku });
  if (packetId) successParams.set("packet_id", packetId);
  const cancelUrl = isTurnSku(sku) ? `${origin}/app` : `${origin}/pricing`;
  const params = {
    mode: catalog.mode,
    line_items: [lineItemForSku(sku)],
    success_url: `${origin}/success?${successParams.toString()}`,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: !isTurnSku(sku),
  };
  if (catalog.mode === "subscription") {
    params.subscription_data = {
      metadata: { ...metadata, spt_plan: "pro" },
    };
  }
  return params;
}

/** Innsegall-style first; optional enrichments only if base session succeeds. */
async function createCheckoutSession(stripeClient, baseParams, sku) {
  const catalog = catalogForSku(sku);
  const attempts = [
    () => ({ ...baseParams, line_items: [lineItemForSku(sku, { forceCatalog: true })] }),
    () => ({ ...baseParams, line_items: [lineItemForSku(sku)] }),
    () => ({ ...baseParams, line_items: [lineItemForSku(sku, { usePriceData: true })] }),
  ];

  let lastErr;
  for (const build of attempts) {
    try {
      return await stripeClient.checkout.sessions.create(build());
    } catch (err) {
      lastErr = err;
      console.warn("spt checkout attempt", sku, err?.message || err);
    }
  }
  throw lastErr;
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

  const envKey =
    sku === "monthly"
      ? "STRIPE_PRICE_MONTHLY"
      : sku === "annual"
        ? "STRIPE_PRICE_ANNUAL"
        : sku === "turn_full"
          ? "STRIPE_PRICE_TURN_FULL"
          : sku === "turn_move_out"
            ? "STRIPE_PRICE_TURN_MOVE_OUT"
            : "";
  const envPrice = envKey ? (process.env[envKey] || "").trim() : "";
  if (
    envPrice &&
    catalog.live_price_id &&
    envPrice !== catalog.live_price_id &&
    process.env.STRIPE_SECRET_KEY.startsWith("sk_live")
  ) {
    console.warn(
      `spt checkout: ignoring stale ${envKey}=${envPrice}; using catalog ${catalog.live_price_id}`,
    );
  }

  try {
    const baseParams = buildBaseSessionParams({ sku, catalog, origin, metadata, packetId });
    const session = await createCheckoutSession(stripe, baseParams, sku);
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    const msg = String(e?.message || e);
    console.error("spt checkout failed", msg);
    const hint =
      /invalid api key|api key/i.test(msg)
        ? "stripe_key_invalid"
        : /no such price|resource_missing.*price/i.test(msg)
          ? "stripe_price_mismatch"
          : "checkout_failed";
    return res.status(500).json({ error: hint });
  }
}
