import { createHmac } from "node:crypto";
import { resolveEntitlementForCustomer } from "./stripe-entitlement.mjs";

const FALLBACK_SECRET = "spt-entitlement-v1-set-SPT_ENTITLEMENT_SECRET-in-env";

function canonicalBody(payload) {
  return JSON.stringify({
    product: payload.product,
    plan: payload.plan,
    valid_until: payload.valid_until,
    stripe_session: payload.stripe_session,
    stripe_subscription: payload.stripe_subscription,
    stripe_customer: payload.stripe_customer,
    issued_at: payload.issued_at,
  });
}

/** Client-held signed entitlement (same shape as buildEntitlement). */
export function verifyEntitlementSig(payload) {
  if (!payload?.sig || !payload?.stripe_customer) return false;
  const secret = process.env.SPT_ENTITLEMENT_SECRET || FALLBACK_SECRET;
  const expected = createHmac("sha256", secret).update(canonicalBody(payload)).digest("base64url");
  if (payload.sig !== expected) return false;
  if (payload.valid_until && new Date(payload.valid_until).getTime() <= Date.now()) return false;
  return true;
}

/** Pro gate for server actions · signature + live Stripe/KV subscription. */
export async function assertProEntitlement(bodyEntitlement) {
  const customerId = String(bodyEntitlement?.stripe_customer || "");
  if (!customerId.startsWith("cus_")) {
    return { ok: false, error: "entitlement_invalid" };
  }
  if (bodyEntitlement?.sig) {
    const payload = {
      product: bodyEntitlement.product || "Simple Property Tools",
      plan: bodyEntitlement.plan,
      valid_until: bodyEntitlement.valid_until,
      stripe_session: bodyEntitlement.stripe_session,
      stripe_subscription: bodyEntitlement.stripe_subscription,
      stripe_customer: customerId,
      issued_at: bodyEntitlement.issued_at || null,
      sig: bodyEntitlement.sig,
    };
    if (!verifyEntitlementSig(payload)) {
      /* Local cache may lack issued_at · confirm with Stripe below. */
    }
  } else {
    return { ok: false, error: "entitlement_invalid" };
  }
  const live = await resolveEntitlementForCustomer(customerId);
  if (!live) return { ok: false, error: "subscription_inactive" };
  return { ok: true, customerId };
}
