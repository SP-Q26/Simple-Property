#!/usr/bin/env node
/** Production smoke + post-smoke content checks (run after deploy). */
import { verifyPageStylesheet } from "./lib/smoke-css-gate.mjs";
import { verifyCourtStripLive } from "./lib/smoke-court-strip.mjs";

const BASE = process.env.SPT_SMOKE_URL || "https://simple-property.com";
const EM = "\u2014";
const paths = [
  {
    name: "home",
    path: "/",
    need: [
      "Never pay the fees",
      "Avoid penalties",
      "pathway-deck",
      "Pick your path",
      "hero-rotate",
      "hero-share-art",
      "spt-share-door.png",
      "viewport-fit=cover",
      "spt-atmosphere",
      "spt-weather",
      "spt-weather-mist",
      "spt-greystone-pilaster",
      "spt-door-monogram",
      "deposit-receipt",
      "40 units",
      "765 ILCS",
      "/feedback",
      "Deposit Desk · free draft",
    ],
    absent: ["Homestead", EM, "spt-door-panel", "Pain:", "Solution:", "link previews"],
    css: true,
  },
  {
    name: "feedback",
    path: "/feedback",
    need: ["Help us fix your turnover headaches", "spt-feedback-form", "viewport-fit=cover"],
    absent: [EM],
    css: true,
  },
  { name: "pricing", path: "/pricing", need: ["pricing-finder", "pricing-cards", "pf-units", "40 units", "Print / Save as PDF"], absent: [EM] },
  {
    name: "blog_hub",
    path: "/blog/",
    need: ['data-spt-page="blog_hub"', "blog-hub-filter.js", "guides-hub"],
    absent: [EM],
    css: true,
  },
  {
    name: "deposit_desk",
    path: "/app",
    need: ["btn-import-packet", "btn-export-packet", "packet-import-file", 'type="module" src="/app.js"'],
    absent: [EM],
  },
  {
    name: "logs",
    path: "/logs",
    need: ["log-tabs", "Operator logs", "maintenance", 'type="module" src="/logs.js"'],
    absent: [],
  },
  {
    name: "compare_leaserooster",
    path: "/blog/deposit-desk-vs-leaserooster-deposits",
    need: ["LeaseRooster", "Deposit Desk", "Never pay the fees"],
    absent: [EM],
  },
  { name: "blog", path: "/blog/deposit-desk-vs-spreadsheet", need: ["Never pay the fees"], absent: ["Homestead", EM] },
  { name: "terms", path: "/terms", need: ["Terms of Service", "32 states", 'href="/privacy"'], absent: [EM] },
  { name: "privacy", path: "/privacy", need: ["Privacy Policy", 'href="/terms"'], absent: [EM] },
  { name: "legal", path: "/legal", need: ["Legal", "/terms", "/privacy"], absent: [EM] },
];

const stripePngs = [
  "pro-monthly",
  "pro-annual",
  "keeper-monthly",
  "portfolio-monthly",
  "turn-move-out",
  "turn-full",
];

let fail = 0;

async function check({ name, path, need, absent, css }) {
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
  if (css) {
    const ok = await verifyPageStylesheet(BASE, text, name);
    if (!ok) fail++;
  }
  if (name === "home") {
    const ok = await verifyCourtStripLive(BASE, text, name);
    if (!ok) fail++;
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

const jsBundles = [
  { name: "blog-hub-filter", path: "/blog-hub-filter.js", need: ["byHref", "cluster-route"] },
  {
    name: "app",
    path: "/app.js",
    need: ["validatePacketImport", "renderC4C5MailLane", "buildC4ReturnLetterText", "buildOperatorLogsHandoffUrl"],
  },
  {
    name: "deposit-mail-lane",
    path: "/lib/deposit-mail-lane.mjs",
    need: ["mail-lane-c4c5", "btn-copy-c4-letter"],
  },
  { name: "packet-backup", path: "/lib/packet-backup.mjs", need: ["PACKET_BACKUP_SCHEMA", "validatePacketImport"] },
  {
    name: "logs",
    path: "/logs.js",
    need: ["log-packet-id", "readPacketCrossRef", "packetId", "getPacketHandoffFromUrl"],
  },
];

async function checkJsBundle({ name, path, need }) {
  const url = `${BASE.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  console.log(`HTTP ${res.status} js ${name} ${path}`);
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

console.log("Smoke base:", BASE);
for (const p of paths) await check(p);

console.log("── Train A+B JS bundles ──");
for (const b of jsBundles) await checkJsBundle(b);

console.log("── Stripe product images (hosted) ──");
for (const name of stripePngs) await checkStripePng(name);

console.log("── Favicon (Vercel / crawlers) ──");
for (const asset of ["favicon.ico", "favicon.svg", "apple-touch-icon.png"]) {
  const url = `${BASE.replace(/\/$/, "")}/${asset}`;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    console.log(`HTTP ${res.status} ${asset}`);
    if (res.status < 200 || res.status >= 400) {
      console.error(`  FAIL ${asset}`);
      fail++;
    } else console.log(`  ok ${asset}`);
  } catch (e) {
    console.error(`  FAIL ${asset} ${e.message}`);
    fail++;
  }
}

if (fail) {
  console.error(`\nProd smoke FAILED (${fail})`);
  process.exit(1);
}
console.log("\nProd smoke OK");
process.exit(0);
