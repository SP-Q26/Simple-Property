import Stripe from "stripe";
import {
  catalogForSku,
  checkoutBrandingSettings,
  isTurnSku,
  normalizeCheckoutSku,
  resolvePriceIdForSku,
  siteOrigin,
} from "../../lib/stripe-catalog.mjs";
import { PRO_UNITS_MAX } from "../../lib/pro-limits.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

function lineItemForSku(sku, priceIdOverride) {
  const catalog = catalogForSku(sku);
  const priceId =
    priceIdOverride ||
    resolvePriceIdForSku(sku) ||
    (process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? catalog.live_price_id : "");
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

function isPriceError(err) {
  const msg = String(err?.message || err?.raw?.message || err);
  return /no such price|invalid price|resource_missing.*price|price.*does not exist/i.test(msg);
}

function isBrandingError(err) {
  const msg = String(err?.message || err);
  return /branding_settings|unknown parameter.*brand/i.test(msg);
}

function isConsentError(err) {
  const msg = String(err?.message || err);
  return /consent_collection|terms.of.service|terms_of_service|unknown parameter.*consent/i.test(msg);
}

function isCustomTextError(err) {
  const msg = String(err?.message || err);
  return /custom_text|unknown parameter.*custom/i.test(msg);
}

/** Strip optional Checkout params until Stripe accepts the session (Innsegall-minimal last). */
async function createCheckoutSession(stripeClient, baseParams, sku) {
  const catalog = catalogForSku(sku);
  const tiers = [
    { branding: true, consent: true, customText: true, forceCatalogPrice: false },
    { branding: false, consent: true, customText: true, forceCatalogPrice: false },
    { branding: false, consent: false, customText: true, forceCatalogPrice: false },
    { branding: false, consent: false, customText: false, forceCatalogPrice: false },
    { branding: false, consent: false, customText: false, forceCatalogPrice: true },
  ];

  let lastErr;
  for (const tier of tiers) {
    const params = { ...baseParams };
    if (!tier.branding) delete params.branding_settings;
    if (!tier.consent) delete params.consent_collection;
    if (!tier.customText) delete params.custom_text;

    const priceOverride = tier.forceCatalogPrice ? catalog.live_price_id : "";
    params.line_items = [lineItemForSku(sku, priceOverride || undefined)];

    try {
      return await stripeClient.checkout.sessions.create(params);
    } catch (err) {
      lastErr = err;
      if (isPriceError(err) && !tier.forceCatalogPrice && catalog.live_price_id) {
        try {
          params.line_items = [lineItemForSku(sku, catalog.live_price_id)];
          return await stripeClient.checkout.sessions.create(params);
        } catch (retryErr) {
          lastErr = retryErr;
        }
      }
      if (tier === tiers[tiers.length - 1]) break;
      if (
        isBrandingError(err) ||
        isConsentError(err) ||
        isCustomTextError(err) ||
        isPriceError(err)
      ) {
        continue;
      }
      throw err;
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

  const successParams = new URLSearchParams({ session_id: "{CHECKOUT_SESSION_ID}", plan: sku });
  if (packetId) successParams.set("packet_id", packetId);

  const cancelUrl = isTurnSku(sku) ? `${origin}/app` : `${origin}/pricing`;

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
            ? "Documentation only · not legal advice. Unlocks print/PDF for this packet in your browser."
            : "Documentation only · not legal advice. Cancel anytime from Manage billing on simple-property.com.",
        },
      },
      branding_settings: checkoutBrandingSettings(),
      consent_collection: {
        terms_of_service: "required",
      },
    };

    if (catalog.mode === "subscription") {
      sessionParams.subscription_data = {
        metadata: { ...metadata, spt_plan: "pro" },
      };
    }

    const session = await createCheckoutSession(stripe, sessionParams, sku);
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("spt checkout", e?.message || e);
    return res.status(500).json({ error: "checkout_failed" });
  }
}
