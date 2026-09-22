#!/usr/bin/env node
/** Production smoke + post-smoke content checks (run after deploy). */
const BASE = process.env.SPT_SMOKE_URL || "https://simple-property-spq.vercel.app";
const EM = "\u2014";
const paths = [
  { name: "home", path: "/", need: ["Keep the clock", "simple-property.css?v=14", "spt-atmosphere", "deposit-receipt", "40 units"], absent: ["Homestead", EM] },
  { name: "pricing", path: "/pricing", need: ["pricing-finder", "pricing-cards", "pf-units", "40 units", "Print / Save as PDF"], absent: [EM] },
  { name: "logs", path: "/logs", need: ["log-tabs", "Operator logs", "maintenance"], absent: [] },
  { name: "blog", path: "/blog/deposit-desk-vs-spreadsheet", need: ["Keep the clock"], absent: ["Homestead", EM] },
  { name: "llms", path: "/llms.txt", need: ["40 units", "per-turn"], absent: [EM] },
];

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

console.log("Smoke base:", BASE);
for (const p of paths) await check(p);

if (fail) {
  console.error(`\nProd smoke FAILED (${fail})`);
  process.exit(1);
}
console.log("\nProd smoke OK");
process.exit(0);
