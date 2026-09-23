#!/usr/bin/env node
/** Production smoke + post-smoke content checks (run after deploy). */
const BASE = process.env.SPT_SMOKE_URL || "https://simple-property.com";
const EM = "\u2014";
const paths = [
  { name: "home", path: "/", need: ["Keep the clock", "Avoid penalties", "pathway-deck", "Pick your path", "hero-rotate", "hero-share-art", "spt-share-door.png", "simple-property.css?v=29", "viewport-fit=cover", "spt-atmosphere", "spt-weather", "spt-weather-mist", "spt-greystone-pilaster", "spt-door-monogram", "deposit-receipt", "40 units", "765 ILCS", "/feedback", "Deposit Desk · start free"], absent: ["Homestead", EM, "spt-door-panel", "Pain:", "Solution:", "link previews"] },
  { name: "feedback", path: "/feedback", need: ["Suggest rulesets", "spt-feedback-form", "simple-property.css?v=29", "viewport-fit=cover"], absent: [EM] },
  { name: "pricing", path: "/pricing", need: ["pricing-finder", "pricing-cards", "pf-units", "40 units", "Print / Save as PDF"], absent: [EM] },
  { name: "logs", path: "/logs", need: ["log-tabs", "Operator logs", "maintenance"], absent: [] },
  { name: "blog", path: "/blog/deposit-desk-vs-spreadsheet", need: ["Keep the clock"], absent: ["Homestead", EM] },
  { name: "terms", path: "/terms", need: ["Terms of Service", "18 US states", 'href="/privacy"'], absent: [EM] },
  { name: "privacy", path: "/privacy", need: ["Privacy Policy", 'href="/terms"'], absent: [EM] },
  { name: "legal", path: "/legal", need: ["Legal", "/terms", "/privacy"], absent: [EM] },
];

const stripePngs = ["pro-monthly", "pro-annual", "turn-move-out", "turn-full"];

let fail = 0;

async function check({ name, path, need, absent }) {
  const url = BASE.replace(/\/$/, "") + path;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  console.log(`HTTP ${res.status} ${name} ${path}`);
  if (res.status !== 200) {
    console.error("  FAIL status");
    fail++;
    return;
  }
  for (const n of need) {
    if (!text.includes(n)) {
      console.error(`  FAIL missing: ${n}`);
      fail++;
    } else console.log(`  ok ${n}`);
  }
  for (const a of absent) {
    if (text.includes(a)) {
      console.error(`  FAIL found: ${a}`);
      fail++;
    } else console.log(`  ok absent ${a}`);
  }
}

async function checkStripePng(name) {
  const url = `${BASE.replace(/\/$/, "")}/stripe/${name}.png`;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    console.log(`HTTP ${res.status} stripe ${name}.png`);
    if (res.status < 200 || res.status >= 400) {
      console.error(`  FAIL stripe image ${name}.png · deploy web/stripe/*.png then npm run sync:stripe-images`);
      fail++;
    } else console.log(`  ok stripe/${name}.png`);
  } catch (e) {
    console.error(`  FAIL stripe ${name}.png ${e.message}`);
    fail++;
  }
}

console.log("Smoke base:", BASE);
for (const p of paths) await check(p);

console.log("── Stripe product images (hosted) ──");
for (const name of stripePngs) await checkStripePng(name);

if (fail) {
  console.error(`\nProd smoke FAILED (${fail})`);
  process.exit(1);
}
console.log("\nProd smoke OK");
process.exit(0);
