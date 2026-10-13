#!/usr/bin/env node
/**
 * Live Stripe Dashboard vs git catalog (names, descriptions, images, prices).
 * Requires STRIPE_SECRET_KEY (sk_live for prod catalog IDs).
 * MCP equivalent: products.retrieve + prices.retrieve per STRIPE_CATALOG entry.
 */
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  STRIPE_CATALOG,
  stripeProductDescription,
  stripeProductImageUrl,
} from "../web/lib/stripe-catalog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "web/package.json"));
const Stripe = require("stripe");

const key = (process.env.STRIPE_SECRET_KEY || "").trim();
if (!key) {
  console.error("STRIPE LIVE AUDIT SKIP: set STRIPE_SECRET_KEY (Dashboard or Vercel integration).");
  process.exit(0);
}

const stripe = new Stripe(key, { apiVersion: "2024-11-20.acacia" });
const isLive = key.startsWith("sk_live");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("STRIPE LIVE FAIL:", label, detail);
    fail++;
  } else console.log("ok:", label);
}

function norm(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

console.log("Stripe live dashboard audit · mode:", isLive ? "live" : "test");
console.log("");

for (const [sku, item] of Object.entries(STRIPE_CATALOG)) {
  const productId = item.live_product_id;
  const priceId = item.live_price_id;
  if (!productId || !priceId) {
    need(`${sku} catalog ids`, false, "missing live_product_id or live_price_id");
    continue;
  }

  let product;
  let price;
  try {
    product = await stripe.products.retrieve(productId);
    price = await stripe.prices.retrieve(priceId);
  } catch (e) {
    need(`${sku} retrieve`, false, e.message);
    continue;
  }

  need(`${sku} product active`, product.active === true);
  need(`${sku} name`, norm(product.name) === norm(item.name), `dashboard="${product.name}"`);
  const wantDesc = stripeProductDescription(sku);
  need(
    `${sku} description`,
    norm(product.description) === norm(wantDesc),
    product.description?.length !== wantDesc.length
      ? `len dashboard=${product.description?.length} canon=${wantDesc.length}`
      : "text mismatch",
  );

  const wantImg = stripeProductImageUrl(sku);
  const dashImg = product.images?.[0] || "";
  need(`${sku} image url`, dashImg === wantImg, dashImg ? "url differs" : "no image on product");

  need(`${sku} price amount`, price.unit_amount === item.unit_amount, `${price.unit_amount} vs ${item.unit_amount}`);
  need(`${sku} price currency`, price.currency === item.currency);
  if (item.mode === "subscription") {
    need(`${sku} recurring interval`, price.recurring?.interval === item.recurring?.interval);
  } else {
    need(`${sku} one-time price`, !price.recurring);
  }

  const meta = product.metadata || {};
  need(`${sku} metadata spt_sku`, meta.spt_sku === item.metadata?.spt_sku);
  need(`${sku} metadata isles_brand`, meta.isles_brand === "deposit_desk");
}

console.log(fail ? `\nStripe live dashboard audit FAILED (${fail})` : "\nStripe live dashboard audit OK");
process.exit(fail ? 1 : 0);
