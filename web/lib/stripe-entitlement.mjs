import Stripe from "stripe";
import { buildEntitlement } from "./entitlement.mjs";
import { getSubscriptionByCustomer, isProStatus, upsertSubscriptionRecord } from "./subscription-store.mjs";

const stripe = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-11-20.acacia",
  });

async function attachCustomerEmail(record) {
  if (record.email || !record.customer_id || !process.env.STRIPE_SECRET_KEY) return record;
  try {
    const cust = await stripe().customers.retrieve(record.customer_id);
    record.email = cust.email || record.email;
  } catch {
    /* ignore */
  }
  return record;
}

export async function recordFromStripeSubscription(sub, skuHint) {
  const validUntil = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;
  const sku = sub.metadata?.spt_sku || skuHint || "annual";
  const record = {
    customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    subscription_id: sub.id,
    status: sub.status,
    valid_until: validUntil,
    sku,
    updated_at: new Date().toISOString(),
  };
  await attachCustomerEmail(record);
  await upsertSubscriptionRecord(record);
  return record;
}

export async function recordFromCheckoutSession(session) {
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id || null;
  const email =
    session.customer_details?.email ||
    session.customer_email ||
    null;
  let sub = null;
  if (session.subscription) {
    sub =
      typeof session.subscription === "string"
        ? await stripe().subscriptions.retrieve(session.subscription)
        : session.subscription;
  }
  const sku = session.metadata?.spt_sku || sub?.metadata?.spt_sku || "annual";
  const record = {
    customer_id: customerId,
    email,
    subscription_id: sub?.id || null,
    status: sub?.status || "active",
    valid_until: sub?.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    sku,
    updated_at: new Date().toISOString(),
  };
  if (customerId) {
    await attachCustomerEmail(record);
    await upsertSubscriptionRecord(record);
  }
  return record;
}

export async function resolveEntitlementForCustomer(customerId) {
  let record = await getSubscriptionByCustomer(customerId);
  if (!record || !isProStatus(record.status)) {
    const subs = await stripe().subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 3,
    });
    const active = subs.data.find((s) => isProStatus(s.status));
    if (active) {
      record = await recordFromStripeSubscription(active);
    } else if (subs.data[0]) {
      record = await recordFromStripeSubscription(subs.data[0]);
    }
  }
  if (!record || !isProStatus(record.status)) {
    return null;
  }
  return buildEntitlement({
    plan: "pro",
    sku: record.sku || "annual",
    valid_until: record.valid_until,
    stripe_subscription: record.subscription_id,
    stripe_customer: record.customer_id,
  });
}

export async function entitlementFromSession(sessionId) {
  const session = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
  if (session.payment_status !== "paid" && session.status !== "complete") {
    return { error: "payment_incomplete", status: session.payment_status };
  }
  await recordFromCheckoutSession(session);
  const sku = session.metadata?.spt_sku || "annual";
  let validUntil = null;
  let subscriptionId = null;
  if (session.mode === "subscription" && session.subscription) {
    const sub =
      typeof session.subscription === "string"
        ? await stripe().subscriptions.retrieve(session.subscription)
        : session.subscription;
    validUntil = new Date(sub.current_period_end * 1000).toISOString();
    subscriptionId = sub.id;
  }
  return buildEntitlement({
    plan: "pro",
    sku,
    valid_until: validUntil,
    stripe_session: session.id,
    stripe_subscription: subscriptionId,
    stripe_customer:
      typeof session.customer === "string" ? session.customer : session.customer?.id || null,
  });
}
