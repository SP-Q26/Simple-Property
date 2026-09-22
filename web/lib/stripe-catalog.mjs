/**
 * Simple Property Tools · Stripe catalog
 * Test-mode placeholders · create Dashboard products before live.
 */
import { PRO_UNITS_MAX } from "./pro-limits.mjs";

const UNITS_META = String(PRO_UNITS_MAX);

export const STRIPE_CATALOG = {
  monthly: {
    sku: "monthly",
    name: "Deposit Desk Pro · Monthly",
    description:
      "Illinois deposit packets · up to 40 units · move-in checklist, deadline tracker, print-ready export.",
    unit_amount: 2200,
    currency: "usd",
    mode: "subscription",
    recurring: { interval: "month" },
    lookup_key: "spt_deposit_monthly",
    metadata: { spt_sku: "monthly", spt_plan: "pro", spt_units_max: UNITS_META },
  },
  annual: {
    sku: "annual",
    name: "Deposit Desk Pro · Annual",
    description:
      "Same as monthly · billed once per year · best value for small Illinois portfolios.",
    unit_amount: 9900,
    currency: "usd",
    mode: "subscription",
    recurring: { interval: "year" },
    lookup_key: "spt_deposit_annual",
    metadata: { spt_sku: "annual", spt_plan: "pro", spt_units_max: UNITS_META },
  },
};

export function catalogForSku(sku) {
  if (sku === "annual") return STRIPE_CATALOG.annual;
  return STRIPE_CATALOG.monthly;
}

export const CANONICAL_SITE_ORIGIN = "https://simpleproperty.tools";

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
