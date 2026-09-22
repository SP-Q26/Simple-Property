import Stripe from "stripe";
import { upsertSubscriptionRecord } from "../../lib/subscription-store.mjs";
import { recordFromCheckoutSession, recordFromStripeSubscription } from "../../lib/stripe-entitlement.mjs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function logEvent(type, payload) {
  console.log(
    JSON.stringify({
      spt_webhook: true,
      type,
      at: new Date().toISOString(),
      ...payload,
    })
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("method_not_allowed");
  }
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(503).send("webhook_not_configured");
  }

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.error("spt webhook verify", e.message);
    return res.status(400).send("Webhook Error");
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const record = await recordFromCheckoutSession(session);
      logEvent("checkout.session.completed", {
        session_id: session.id,
        sku: session.metadata?.spt_sku,
        customer: record.customer_id,
        kv: Boolean(record.customer_id),
      });
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object;
      const skuHint = sub.metadata?.spt_sku;
      if (event.type === "customer.subscription.deleted" || sub.status === "canceled") {
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        await upsertSubscriptionRecord({
          customer_id: customerId,
          subscription_id: sub.id,
          status: sub.status,
          valid_until: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          sku: skuHint || "annual",
          updated_at: new Date().toISOString(),
        });
      } else {
        await recordFromStripeSubscription(sub, skuHint);
      }
      logEvent(event.type, {
        subscription_id: sub.id,
        status: sub.status,
        customer: sub.customer,
      });
    } else if (event.type === "invoice.paid") {
      const inv = event.data.object;
      if (inv.billing_reason === "subscription_cycle") {
        logEvent("subscription_renewal", {
          invoice_id: inv.id,
          customer: inv.customer,
          amount_paid: inv.amount_paid,
        });
      }
    }
  } catch (e) {
    console.error("spt webhook handler", e.message);
    return res.status(500).json({ received: false });
  }

  return res.status(200).json({ received: true });
}
