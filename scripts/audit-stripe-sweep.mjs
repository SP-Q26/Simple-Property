#!/usr/bin/env node
/** Git catalog ↔ documented Isles SKUs (amounts + live price IDs). */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mod = await import(join(root, "web/lib/stripe-catalog.mjs"));
const { STRIPE_CATALOG } = mod;

const EXPECT = {
  monthly: 2200,
  annual: 9900,
  turn_move_out: 2900,
  turn_full: 4900,
  keeper_monthly: 2900,
  portfolio_monthly: 7900,
};

let fail = 0;
function need(label, ok) {
  if (!ok) {
    console.error("STRIPE SWEEP FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

need("six catalog skus", Object.keys(STRIPE_CATALOG).length === 6);
for (const [key, amount] of Object.entries(EXPECT)) {
  const item = STRIPE_CATALOG[key];
  need(`${key} amount $${amount / 100}`, item?.unit_amount === amount);
  need(`${key} live_price_id`, /^price_/.test(item?.live_price_id || ""));
  need(`${key} live_product_id`, /^prod_/.test(item?.live_product_id || ""));
  need(`${key} lookup_key`, item?.lookup_key?.startsWith("spt_"));
}

const envExample = readFileSync(join(root, "web/.env.example"), "utf8");
need("env example keeper", envExample.includes("STRIPE_PRICE_KEEPER_MONTHLY"));
need("env example portfolio", envExample.includes("STRIPE_PRICE_PORTFOLIO_MONTHLY"));

console.log(fail ? `\nStripe sweep audit FAILED (${fail})` : "\nStripe sweep audit OK");
process.exit(fail ? 1 : 0);
