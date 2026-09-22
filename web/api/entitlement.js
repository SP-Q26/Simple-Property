import {
  entitlementFromSession,
  resolveEntitlementForCustomer,
} from "../lib/stripe-entitlement.mjs";
import { consumeMagicToken } from "../lib/magic-link.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "stripe_not_configured" });
  }

  const sessionId = req.query?.session_id;
  const customerId = req.query?.customer_id;
  const magic = req.query?.magic;
  const sig = req.query?.sig;

  try {
    if (magic && sig) {
      const consumed = await consumeMagicToken(String(magic), String(sig));
      if (!consumed) {
        return res.status(401).json({ error: "magic_invalid" });
      }
      const entitlement = await resolveEntitlementForCustomer(consumed.customer_id);
      if (!entitlement) {
        return res.status(402).json({ error: "subscription_inactive" });
      }
      res.setHeader("Cache-Control", "private, no-store");
      return res.status(200).json(entitlement);
    }

    if (sessionId && String(sessionId).startsWith("cs_")) {
      const result = await entitlementFromSession(String(sessionId));
      if (result?.error) {
        return res.status(402).json(result);
      }
      res.setHeader("Cache-Control", "private, no-store");
      return res.status(200).json(result);
    }

    if (customerId && String(customerId).startsWith("cus_")) {
      const entitlement = await resolveEntitlementForCustomer(String(customerId));
      if (!entitlement) {
        return res.status(402).json({ error: "subscription_inactive" });
      }
      res.setHeader("Cache-Control", "private, no-store");
      return res.status(200).json(entitlement);
    }

    return res.status(400).json({ error: "missing_session_customer_or_magic" });
  } catch (e) {
    console.error("spt entitlement", e);
    return res.status(500).json({ error: "entitlement_failed" });
  }
}
