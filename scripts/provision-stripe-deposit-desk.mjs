#!/usr/bin/env node
/**
 * Provision Deposit Desk products on The Isles Stripe account (live or test).
 * Dry-run by default · pass --apply to create · pass --set-lookup-keys to patch lookup_key on prices.
 *
 *   export STRIPE_SECRET_KEY=sk_live_…   # or sk_test_…
 *   node scripts/provision-stripe-deposit-desk.mjs
 *   node scripts/provision-stripe-deposit-desk.mjs --apply --set-lookup-keys
 *
 * After --apply, paste printed price_… IDs into Vercel STRIPE_PRICE_* and git catalog live_* fields.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mod = await import(join(root, "web/lib/stripe-catalog.mjs"));
const { STRIPE_CATALOG, stripeProductImageUrl } = mod;

const APPLY = process.argv.includes("--apply");
const SET_LOOKUP = process.argv.includes("--set-lookup-keys");
const LIVE = !process.argv.includes("--test");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Set STRIPE_SECRET_KEY (sk_test_… or sk_live_…).");
  process.exit(1);
}

const Stripe = (await import("stripe")).default;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" });

const ISLES_URL = "https://simple-property.com/pricing";

/** Cross-brand Isles metadata (parallel Innsegall isles_brand / isles_lane / isles_portfolio). */
function productMetadata(entry) {
  const lane = {
    monthly: "spt_pro_monthly",
    annual: "spt_pro_annual",
    turn_move_out: "spt_turn_move_out",
    turn_full: "spt_turn_full",
  }[entry.sku];
  const meta = {
    isles_portfolio: "the_isles",
    isles_brand: "deposit_desk",
    isles_lane: lane,
    isles_product: "deposit_desk",
    spt_sku: entry.metadata.spt_sku,
    spt_plan: entry.metadata.spt_plan,
  };
  if (entry.metadata.spt_units_max) meta.spt_units_max = entry.metadata.spt_units_max;
  return meta;
}

function priceMetadata(entry) {
  return {
    isles_product: "deposit_desk",
    spt_sku: entry.metadata.spt_sku,
    spt_plan: entry.metadata.spt_plan,
  };
}

async function findExistingByLane(lane) {
  const res = await stripe.products.search({
    query: `metadata['isles_lane']:'${lane}' AND active:'true'`,
  });
  return res.data[0] || null;
}

async function ensureProduct(key, entry) {
  const lane = productMetadata(entry).isles_lane;
  const existing = await findExistingByLane(lane);
  if (existing) {
    console.log("EXISTS", key, existing.id, existing.name);
    return existing;
  }

  const payload = {
    name: entry.name,
    description: entry.stripe_description || entry.description,
    url: ISLES_URL,
    images: [stripeProductImageUrl(key) || "https://simple-property.com/stripe/pro-monthly.png"],
    metadata: productMetadata(entry),
    default_price_data: {
      currency: entry.currency,
      unit_amount: entry.unit_amount,
      metadata: priceMetadata(entry),
      ...(entry.recurring ? { recurring: entry.recurring } : {}),
    },
  };
  if (entry.mode === "subscription") {
    payload.statement_descriptor = "DEPOSIT DESK PRO";
  }

  if (!APPLY) {
    console.log("DRY-RUN create", key, payload.name, `$${entry.unit_amount / 100}`);
    return null;
  }

  const created = await stripe.products.create(payload);
  console.log("CREATED", key, created.id, "default_price", created.default_price);
  return created;
}

async function setLookupOnProduct(product, lookupKey) {
  if (!product?.default_price || !SET_LOOKUP) return;
  const priceId = typeof product.default_price === "string" ? product.default_price : product.default_price.id;
  if (!APPLY) {
    console.log("DRY-RUN lookup_key", lookupKey, "→", priceId);
    return;
  }
  await stripe.prices.update(priceId, { lookup_key: lookupKey, transfer_lookup_key: true });
  console.log("LOOKUP", lookupKey, priceId);
}

async function main() {
  console.log("Mode:", LIVE ? "live key" : "--test", APPLY ? "APPLY" : "dry-run");
  console.log("Account products to ensure:", Object.keys(STRIPE_CATALOG).join(", "));
  console.log("");

  const report = {};
  for (const [key, entry] of Object.entries(STRIPE_CATALOG)) {
    const product = await ensureProduct(key, entry);
    if (product) {
      await setLookupOnProduct(product, entry.lookup_key);
      const priceId =
        typeof product.default_price === "string" ? product.default_price : product.default_price?.id;
      report[key] = { product_id: product.id, price_id: priceId, lookup_key: entry.lookup_key };
    }
  }

  if (Object.keys(report).length) {
    console.log("\n--- Vercel env (Production) ---");
    const map = {
      monthly: "STRIPE_PRICE_MONTHLY",
      annual: "STRIPE_PRICE_ANNUAL",
      turn_move_out: "STRIPE_PRICE_TURN_MOVE_OUT",
      turn_full: "STRIPE_PRICE_TURN_FULL",
    };
    for (const [sku, ids] of Object.entries(report)) {
      console.log(`${map[sku]}=${ids.price_id}  # ${ids.product_id}`);
    }
  }

  if (!APPLY) {
    console.log("\nRe-run with --apply to create missing products.");
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
