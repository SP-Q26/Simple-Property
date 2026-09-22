#!/usr/bin/env node
/**
 * Push catalog checkout_image URLs to Stripe products (test or live).
 * Images only — use sync-stripe-products.mjs when name/description must change too.
 *
 * Requires STRIPE_SECRET_KEY (sk_test_… or sk_live_…).
 *
 *   npm run export:stripe-images
 *   deploy so https://simple-property.com/stripe/*.png returns 200
 *   STRIPE_SECRET_KEY=sk_test_… npm run sync:stripe-images
 *   STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-images
 */
import { STRIPE_CATALOG, stripeProductImageUrl } from "../web/lib/stripe-catalog.mjs";

const sk = process.env.STRIPE_SECRET_KEY || "";
const live = sk.startsWith("sk_live_");
const test = sk.startsWith("sk_test_");

if (!live && !test) {
  console.error("Set STRIPE_SECRET_KEY to sk_test_… or sk_live_…");
  process.exit(1);
}

const idKey = live ? "live_product_id" : "test_product_id";
let failed = 0;

for (const [sku, item] of Object.entries(STRIPE_CATALOG)) {
  const productId = item[idKey];
  const imageUrl = stripeProductImageUrl(sku);
  if (!productId) {
    console.error(`skip ${sku}: no ${idKey}`);
    failed++;
    continue;
  }
  if (!imageUrl) {
    console.error(`skip ${sku}: no checkout_image`);
    failed++;
    continue;
  }

  const body = new URLSearchParams();
  body.append("images[0]", imageUrl);

  const res = await fetch(`https://api.stripe.com/v1/products/${productId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sk}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`FAIL ${sku} ${productId}: ${data.error?.message || res.status}`);
    failed++;
    continue;
  }
  const got = data.images?.[0] || "";
  console.log(`ok ${sku} ${productId} → ${got.slice(0, 72)}…`);
}

if (failed) process.exit(1);
console.log(`\nStripe product images synced (${live ? "live" : "test"})`);
