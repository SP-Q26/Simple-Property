#!/usr/bin/env node
/** Extended production HTTP smoke · static routes, discovery, API shape (no card). */
const BASE = (process.env.SPT_SMOKE_URL || "https://simple-property.com").replace(/\/$/, "");

const pages = [
  { path: "/app", need: ["wizard-steps", "packet-select", "Deposit packet", "simple-property.css?v=33"] },
  { path: "/launch-stack", need: ["Launch stack", "Deposit Desk", "doors"] },
  { path: "/success", need: ["Payment confirmed", "session_id", "sptRefreshEntitlement"] },
  { path: "/blog", need: ["Guides", "blog"] },
  { path: "/llms.txt", need: ["Deposit Desk", "simple-property.com", "765 ILCS", "18 states + DC"] },
  { path: "/robots.txt", need: ["Sitemap:", "simple-property.com"] },
];

const jsonRoutes = [
  { path: "/.well-known/spt-gospel.json", keys: ["product", "pricing", "tagline"] },
  { path: "/spt-ai-bus.json", keys: ["site", "product"] },
];

let fail = 0;

async function get(path) {
  const url = BASE + path;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { url, res, text };
}

async function checkPage({ path, need }) {
  const { res, text } = await get(path);
  console.log(`HTTP ${res.status} page ${path}`);
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
}

async function checkJson({ path, keys }) {
  const { res, text } = await get(path);
  console.log(`HTTP ${res.status} json ${path}`);
  if (res.status !== 200) {
    console.error("  FAIL status");
    fail++;
    return;
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("  FAIL invalid JSON");
    fail++;
    return;
  }
  for (const k of keys) {
    if (data[k] === undefined) {
      console.error(`  FAIL missing key: ${k}`);
      fail++;
    } else console.log(`  ok ${k}`);
  }
}

async function checkSitemap() {
  const { res, text } = await get("/sitemap.xml");
  console.log(`HTTP ${res.status} sitemap.xml`);
  if (res.status !== 200) {
    fail++;
    return;
  }
  for (const loc of ["/feedback", "/app", "/pricing", "/blog"]) {
    if (!text.includes(`simple-property.com${loc}`) && !text.includes(`${loc}`)) {
      console.error(`  FAIL missing loc ${loc}`);
      fail++;
    } else console.log(`  ok loc ${loc}`);
  }
}

async function checkApiShapes() {
  const checkoutGet = await fetch(`${BASE}/api/stripe/checkout`, { method: "GET" });
  console.log(`HTTP ${checkoutGet.status} GET /api/stripe/checkout (expect 405)`);
  if (checkoutGet.status !== 405) {
    console.error("  FAIL expected 405");
    fail++;
  } else console.log("  ok method_not_allowed");

  const fb = await fetch(`${BASE}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ website: "bot", category: "other", message: "smoke probe ignore" }),
  });
  console.log(`HTTP ${fb.status} POST /api/feedback honeypot (expect 200 ok)`);
  if (fb.status !== 200) {
    console.error("  FAIL honeypot should silently succeed");
    fail++;
  } else console.log("  ok honeypot");
}

console.log("Extended smoke base:", BASE);
for (const p of pages) await checkPage(p);
for (const j of jsonRoutes) await checkJson(j);
await checkSitemap();
await checkApiShapes();

const ogPng = await fetch(`${BASE}/og/spt-share-door.png`, { method: "HEAD" });
console.log(`HTTP ${ogPng.status} HEAD /og/spt-share-door.png`);
if (ogPng.status !== 200) {
  console.error("  FAIL OG PNG for link previews");
  fail++;
} else console.log("  ok share door png");

if (fail) {
  console.error(`\nExtended prod smoke FAILED (${fail})`);
  process.exit(1);
}
console.log("\nExtended prod smoke OK");
process.exit(0);
