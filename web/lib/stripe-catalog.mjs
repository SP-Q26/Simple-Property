/**
 * Simple Property Tools · Stripe catalog (Isles account · shared branding with Innsegall)
 * Dashboard setup: docs/STRIPE_ISLES_CATALOG.md · live IDs provisioned 2026-09-22
 */
import { PRO_UNITS_MAX } from "./pro-limits.mjs";

const UNITS_META = String(PRO_UNITS_MAX);

export const STRIPE_CATALOG = {
  monthly: {
    sku: "monthly",
    name: "Deposit Desk Pro · Monthly",
    description:
      "Midwest deposit packets · up to 40 units · move-in checklist, deadline tracker, print-ready export.",
    unit_amount: 2200,
    currency: "usd",
    mode: "subscription",
    recurring: { interval: "month" },
    lookup_key: "spt_deposit_monthly",
    live_product_id: "prod_VJ4quXggKOi2IH",
    live_price_id: "price_1UISgaFDJKTJlxOcKl4GklhT",
    metadata: {
      spt_sku: "monthly",
      spt_plan: "pro",
      spt_units_max: UNITS_META,
      isles_product: "deposit_desk",
      isles_brand: "deposit_desk",
      isles_portfolio: "the_isles",
      isles_lane: "spt_pro_monthly",
    },
  },
  annual: {
    sku: "annual",
    name: "Deposit Desk Pro · Annual",
    description:
      "Same as monthly · billed once per year · best value for steady turnover.",
    unit_amount: 9900,
    currency: "usd",
    mode: "subscription",
    recurring: { interval: "year" },
    lookup_key: "spt_deposit_annual",
    live_product_id: "prod_VJ4qakw2M82ks6",
    live_price_id: "price_1UISgbFDJKTJlxOcrzEvEi1X",
    metadata: {
      spt_sku: "annual",
      spt_plan: "pro",
      spt_units_max: UNITS_META,
      isles_product: "deposit_desk",
      isles_brand: "deposit_desk",
      isles_portfolio: "the_isles",
      isles_lane: "spt_pro_annual",
    },
  },
  turn_move_out: {
    sku: "turn_move_out",
    name: "Deposit Desk · Move-out print unlock",
    description:
      "One surrender packet · itemization + deadline + print/PDF for this tenancy event.",
    unit_amount: 2900,
    currency: "usd",
    mode: "payment",
    lookup_key: "spt_turn_move_out",
    live_product_id: "prod_VJ4qJEUYugqYml",
    live_price_id: "price_1UISgcFDJKTJlxOcQ6r3L6Xb",
    metadata: {
      spt_sku: "turn_move_out",
      spt_plan: "turn",
      isles_product: "deposit_desk",
      isles_brand: "deposit_desk",
      isles_portfolio: "the_isles",
      isles_lane: "spt_turn_move_out",
    },
  },
  turn_full: {
    sku: "turn_full",
    name: "Deposit Desk · Full tenancy print unlock",
    description:
      "Move-in and move-out on one packet id · print/PDF export for the full lease turn.",
    unit_amount: 4900,
    currency: "usd",
    mode: "payment",
    lookup_key: "spt_turn_full",
    live_product_id: "prod_VJ4q8T0mIlJpM7",
    live_price_id: "price_1UISgdFDJKTJlxOch3r5LixS",
    metadata: {
      spt_sku: "turn_full",
      spt_plan: "turn",
      isles_product: "deposit_desk",
      isles_brand: "deposit_desk",
      isles_portfolio: "the_isles",
      isles_lane: "spt_turn_full",
    },
  },
};

const SKU_ALIASES = {
  turn_move_in: "turn_move_out",
  turn: "turn_move_out",
};

export function normalizeCheckoutSku(raw) {
  const s = String(raw || "annual").trim();
  if (SKU_ALIASES[s]) return SKU_ALIASES[s];
  if (STRIPE_CATALOG[s]) return s;
  if (s === "monthly" || s === "annual") return s;
  return "annual";
}

export function catalogForSku(sku) {
  const key = normalizeCheckoutSku(sku);
  return STRIPE_CATALOG[key] || STRIPE_CATALOG.annual;
}

export function isTurnSku(sku) {
  const key = normalizeCheckoutSku(sku);
  return key === "turn_move_out" || key === "turn_full";
}

export function priceEnvKeyForSku(sku) {
  const key = normalizeCheckoutSku(sku);
  if (key === "annual") return "STRIPE_PRICE_ANNUAL";
  if (key === "monthly") return "STRIPE_PRICE_MONTHLY";
  if (key === "turn_full") return "STRIPE_PRICE_TURN_FULL";
  if (key === "turn_move_out") return "STRIPE_PRICE_TURN_MOVE_OUT";
  return "STRIPE_PRICE_ANNUAL";
}

/** Prefer Vercel STRIPE_PRICE_*; fall back to catalog live_price_id when using sk_live. */
export function resolvePriceIdForSku(sku) {
  const envKey = priceEnvKeyForSku(sku);
  const fromEnv = (process.env[envKey] || "").trim();
  if (fromEnv) return fromEnv;
  const item = catalogForSku(sku);
  if (process.env.STRIPE_SECRET_KEY?.startsWith("sk_live")) {
    return item.live_price_id || "";
  }
  return "";
}

export const CANONICAL_SITE_ORIGIN = "https://simple-property.com";

export function siteOrigin() {
  const explicit = (process.env.SPT_SITE_URL || "").trim();
  if (explicit) {
    const raw = explicit.startsWith("http") ? explicit : `https://${explicit}`;
    return raw.replace(/\/$/, "");
  }
  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_SITE_ORIGIN;
  }
  const vercel = (process.env.VERCEL_URL || "").trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return CANONICAL_SITE_ORIGIN;
}
