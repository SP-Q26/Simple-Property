#!/usr/bin/env node
/**
 * Branding + mom-and-pop copy sweep (customer surfaces + Stripe catalog + checkout).
 */
import { readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const EM = "\u2014";
const BRAND_TAG = "Itemize it. Date it. Keep the clock. · IL · IN · OH · MI · IA · MO";
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("BRANDING FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const customerCopyFiles = [
  "index.html",
  "pricing.html",
  "app.html",
  "success.html",
  "terms.html",
  "privacy.html",
  "legal.html",
  "launch-stack.html",
  "success.html",
  "sp-checkout.js",
  "sp-billing.js",
  "llms.txt",
];

const forbiddenCustomer = [
  "customer portal",
  "redis",
  "sk_live",
  "sk_test",
  "innsegall",
  "spquant",
  "weweb",
  "homestead",
  "same stripe as",
  "plain dealing",
];

for (const rel of customerCopyFiles) {
  const p = join(web, rel);
  if (!statSync(p).isFile()) continue;
  const text = readFileSync(p, "utf8");
  const low = text.toLowerCase();
  if (text.includes(EM)) need(`${rel} no em dash`, false);
  for (const term of forbiddenCustomer) {
    if (low.includes(term)) need(`${rel} off-brand term: ${term.trim()}`, false);
  }
}

need("gospel 40 doors", readFileSync(join(web, ".well-known/spt-gospel.json"), "utf8").includes("40 doors"));
need("gospel tagline", readFileSync(join(web, ".well-known/spt-gospel.json"), "utf8").includes("Keep the clock"));

const catalogSrc = readFileSync(join(web, "lib/stripe-catalog.mjs"), "utf8");
need("catalog checkout_image paths", catalogSrc.includes('checkout_image: "/stripe/'));
need("catalog display branding fn", catalogSrc.includes("checkoutBrandingSettings"));
need("catalog not legal advice in stripe_description", catalogSrc.includes("Not legal advice"));
need("catalog Manage billing not Portal", !catalogSrc.toLowerCase().includes("customer portal"));
need("catalog 40 units in metadata", catalogSrc.includes("spt_units_max"));

const checkout = readFileSync(join(web, "api/stripe/checkout.js"), "utf8");
need("checkout branding_settings", checkout.includes("branding_settings"));
need("checkout consent terms", checkout.includes('terms_of_service: "required"'));
need("checkout mom-and-pop submit copy", checkout.includes("Manage billing on simple-property.com"));
need("checkout no Customer Portal", !checkout.toLowerCase().includes("customer portal"));

for (const page of ["index.html", "pricing.html", "success.html", "terms.html"]) {
  const h = readFileSync(join(web, page), "utf8");
  need(`${page} brand tag`, h.includes(BRAND_TAG));
  need(`${page} not legal advice`, h.includes("not legal advice") || h.includes("Not legal advice"));
}

const pricing = readFileSync(join(web, "pricing.html"), "utf8");
need("pricing Manage billing button", pricing.includes("spt-billing-portal"));
need("pricing 40 units", pricing.includes("40 units"));

const gospel = JSON.parse(readFileSync(join(web, ".well-known/spt-gospel.json"), "utf8"));
need("gospel pricing 22", gospel.pricing?.monthly_usd === 22);
need("gospel pricing 99", gospel.pricing?.annual_usd === 99);

console.log(fail ? `\nBranding copy audit FAILED (${fail})` : "\nBranding copy audit OK");
process.exit(fail ? 1 : 0);
