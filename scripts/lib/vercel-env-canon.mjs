/**
 * Canonical Vercel env matrix for simple-property · code + docs source of truth.
 * Runtime reads process.env; this file is for audits only (no secrets).
 */
import { STRIPE_CATALOG, priceEnvKeyForSku } from "../../web/lib/stripe-catalog.mjs";

/** @typedef {"required" | "optional" | "integration" | "unused"} EnvRole */

export const VERCEL_ENV_CANON = [
  {
    key: "STRIPE_SECRET_KEY",
    role: "required",
    targets: ["production", "preview"],
    usedBy: "All Stripe API routes",
    sensitive: true,
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    role: "required",
    targets: ["production", "preview"],
    usedBy: "POST /api/stripe/webhook",
    sensitive: true,
  },
  {
    key: "SPT_ENTITLEMENT_SECRET",
    role: "required",
    targets: ["production", "preview"],
    usedBy: "Entitlement HMAC + magic links",
    sensitive: true,
  },
  {
    key: "SPT_SITE_URL",
    role: "optional",
    targets: ["preview"],
    usedBy: "Checkout success/cancel override (production uses apex from VERCEL_ENV)",
    sensitive: false,
  },
  {
    key: "KV_REST_API_URL",
    role: "required",
    targets: ["production", "preview"],
    usedBy: "web/lib/kv-client.mjs · @vercel/kv",
    sensitive: false,
    integration: "Upstash Redis (Vercel Storage)",
  },
  {
    key: "KV_REST_API_TOKEN",
    role: "required",
    targets: ["production", "preview"],
    usedBy: "web/lib/kv-client.mjs · @vercel/kv",
    sensitive: true,
    integration: "Upstash Redis (Vercel Storage)",
  },
  {
    key: "KV_REST_API_READ_ONLY_TOKEN",
    role: "unused",
    targets: [],
    usedBy: "Delete in Vercel if present · not used by @vercel/kv",
    sensitive: true,
    vercelRemove: true,
  },
  {
    key: "KV_URL",
    role: "unused",
    targets: [],
    usedBy: "Delete in Vercel if present · legacy Upstash alias",
    sensitive: true,
    vercelRemove: true,
  },
  {
    key: "REDIS_URL",
    role: "unused",
    targets: [],
    usedBy: "Delete in Vercel if present · node-redis only",
    sensitive: true,
    vercelRemove: true,
  },
  {
    key: "RESEND_EMAIL_DOMAIN",
    role: "unused",
    targets: [],
    usedBy: "Resend integration inject · app uses SPT_EMAIL_FROM only",
    sensitive: true,
    vercelRemove: true,
  },
  {
    key: "RESEND_API_KEY",
    role: "required",
    targets: ["production", "preview"],
    usedBy: "web/lib/resend.mjs",
    sensitive: true,
    integration: "Resend marketplace (optional)",
  },
  {
    key: "SPT_EMAIL_FROM",
    role: "required",
    targets: ["production", "preview"],
    usedBy: "Resend from header",
    sensitive: false,
  },
  {
    key: "SPT_FEEDBACK_TO",
    role: "optional",
    targets: ["production", "preview"],
    usedBy: "Feedback notification inbox",
    sensitive: false,
  },
  {
    key: "SPT_CRON_SECRET",
    role: "optional",
    targets: ["production", "preview"],
    usedBy: "Manual cron tests · Vercel injects CRON_SECRET",
    sensitive: true,
  },
  {
    key: "CRON_SECRET",
    role: "optional",
    targets: ["production"],
    usedBy: "Vercel Cron auth (platform)",
    sensitive: true,
  },
];

/** Stripe price env vars derived from git catalog live_price_id */
export function stripePriceEnvCanon() {
  return Object.keys(STRIPE_CATALOG).map((sku) => ({
    key: priceEnvKeyForSku(sku),
    sku,
    livePriceId: STRIPE_CATALOG[sku].live_price_id,
    role: "optional",
    targets: ["production", "preview"],
    usedBy: "resolvePriceIdForSku · sk_test uses env; sk_live prefers catalog",
    sensitive: false,
  }));
}

export function allCanonKeys() {
  const stripe = stripePriceEnvCanon().map((r) => r.key);
  const base = VERCEL_ENV_CANON.map((r) => r.key);
  return [...new Set([...base, ...stripe])];
}
