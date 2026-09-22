#!/usr/bin/env node
/** Live checkout smoke · no card charged. */
const BASE = (process.env.SPT_SMOKE_URL || "https://simple-property.com").replace(/\/$/, "");

const probes = [
  { name: "annual", body: { sku: "annual" } },
  { name: "monthly", body: { sku: "monthly" } },
  {
    name: "turn_move_out",
    body: { sku: "turn_move_out", packet_id: "smokepkt12345678" },
  },
];

let fail = 0;

async function probe({ name, body }) {
  const url = `${BASE}/api/stripe/checkout`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  console.log(`HTTP ${res.status} checkout ${name}`);
  if (res.status !== 200 || !json.url) {
    console.error("  FAIL", json.error || json.raw || text.slice(0, 120));
    fail++;
    return;
  }
  if (!String(json.url).includes("checkout.stripe.com")) {
    console.error("  FAIL url not Stripe Hosted", json.url);
    fail++;
    return;
  }
  console.log("  ok url", json.id || "(session)");
}

console.log("Checkout smoke base:", BASE);
for (const p of probes) await probe(p);

if (fail) {
  console.error(`\nCheckout smoke FAILED (${fail})`);
  process.exit(1);
}
console.log("\nCheckout smoke OK");
process.exit(0);
