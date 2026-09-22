#!/usr/bin/env node
/**
 * Verify Stripe catalog env + optional live price lookup.
 * Usage: cd web && node ../scripts/verify-stripe-catalog.mjs
 * Requires STRIPE_SECRET_KEY in env or web/.env.local (not loaded automatically — export first).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "web/lib/stripe-catalog.mjs");

if (!existsSync(catalogPath)) {
  console.error("Missing stripe-catalog.mjs");
  process.exit(1);
}

const mod = await import(catalogPath);
const { STRIPE_CATALOG } = mod;

console.log("Catalog SKUs:", Object.keys(STRIPE_CATALOG).join(", "));
for (const [key, item] of Object.entries(STRIPE_CATALOG)) {
  console.log(`  ${key}: $${(item.unit_amount / 100).toFixed(2)}/${item.recurring?.interval || "once"} · ${item.name}`);
}

const envKeys = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SPT_ENTITLEMENT_SECRET", "STRIPE_PRICE_MONTHLY", "STRIPE_PRICE_ANNUAL"];
let warn = 0;
for (const k of envKeys) {
  if (!process.env[k]) {
    console.warn("WARN missing env", k);
    warn++;
  }
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.log("\nSet STRIPE_SECRET_KEY to validate Dashboard price IDs.");
  process.exit(warn ? 1 : 0);
}

const Stripe = (await import("stripe")).default;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" });

for (const envName of ["STRIPE_PRICE_MONTHLY", "STRIPE_PRICE_ANNUAL"]) {
  const id = process.env[envName];
  if (!id) continue;
  try {
    const price = await stripe.prices.retrieve(id);
    console.log("OK", envName, price.id, price.unit_amount, price.currency, price.recurring?.interval);
  } catch (e) {
    console.error("FAIL", envName, e.message);
    process.exit(1);
  }
}

console.log("\nCatalog verify complete.");
