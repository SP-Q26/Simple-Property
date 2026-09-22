import { createHmac } from "node:crypto";

const FALLBACK_SECRET = "spt-entitlement-v1-set-SPT_ENTITLEMENT_SECRET-in-env";

function canonicalBody(payload) {
  const base = {
    product: payload.product,
    plan: payload.plan,
    valid_until: payload.valid_until,
    stripe_session: payload.stripe_session,
    stripe_subscription: payload.stripe_subscription,
    stripe_customer: payload.stripe_customer,
    issued_at: payload.issued_at,
  };
  if (payload.packet_id) base.packet_id = payload.packet_id;
  return JSON.stringify(base);
}

export function buildEntitlement(opts) {
  const secret = process.env.SPT_ENTITLEMENT_SECRET || FALLBACK_SECRET;
  const payload = {
    product: "Simple Property Tools",
    plan: opts.plan || "pro",
    sku: opts.sku || "annual",
    valid_until: opts.valid_until || null,
    stripe_session: opts.stripe_session || null,
    stripe_subscription: opts.stripe_subscription || null,
    stripe_customer: opts.stripe_customer || null,
    issued_at: opts.issued_at || new Date().toISOString(),
  };
  if (opts.packet_id) payload.packet_id = opts.packet_id;
  payload.sig = createHmac("sha256", secret).update(canonicalBody(payload)).digest("base64url");
  return payload;
}
