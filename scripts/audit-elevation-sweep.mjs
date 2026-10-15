#!/usr/bin/env node
/**
 * Overarching elevation gate · branding, lane, pricing, copy, blog, related reading.
 * Runs focused child audits + lane checks (exit 1 on any failure).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function run(script) {
  const r = spawnSync(process.execPath, [join(root, "scripts", script)], { stdio: "inherit" });
  if (r.status !== 0) fail++;
}

function need(label, ok) {
  if (!ok) {
    console.error("ELEVATION FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const childAudits = [
  "audit-branding-copy.mjs",
  "audit-brand-tagline.mjs",
  "audit-site-nav.mjs",
  "audit-pricing.mjs",
  "audit-pain-copy.mjs",
  "audit-goal-copy.mjs",
  "audit-blog-goal-copy.mjs",
  "audit-blog-related.mjs",
  "audit-customer-voice.mjs",
  "audit-customer-lane.mjs",
  "audit-hub-copy.mjs",
  "audit-receipt-rail-spec.mjs",
  "audit-stripe-sweep.mjs",
  "audit-route-series.mjs",
];

console.log("=== Elevation sweep · child audits ===\n");
for (const script of childAudits) run(script);

console.log("\n=== Elevation sweep · lane & suite ===\n");

const modules = readFileSync(join(web, "modules.html"), "utf8");
const pricing = readFileSync(join(web, "pricing.html"), "utf8");
const index = readFileSync(join(web, "index.html"), "utf8");
const laneMaster = readFileSync(join(root, "docs/SIMPLE_PROPERTY_LANE_MASTER.md"), "utf8");

need("lane master doc", laneMaster.includes("Program A") && laneMaster.includes("Condition hub"));
need("modules Condition hub naming", modules.includes("Condition hub"));
need("modules Deposit Desk CTA", modules.includes('href="/app"'));
need("pricing 40 units", pricing.includes("40 units"));
need("pricing per-turn $29/$49", pricing.includes("$29") && pricing.includes("$49"));
need("pricing suite lanes documented", pricing.includes("Keeper") && pricing.includes("Portfolio"));
need("pricing links modules", pricing.includes("/modules"));
need("index hub pathway", index.includes("/hub") || index.includes("Condition hub"));
need("index modules or suite", index.includes("/modules") || index.includes("Simple Property Tools"));
need("gospel file", existsSync(join(web, ".well-known/spt-gospel.json")));
need("ai bus", existsSync(join(web, "spt-ai-bus.json")));

const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));
need("blog manifest posts", manifest.posts.length >= 200);
const news = manifest.posts.filter((p) => p.category === "news");
need("news posts catalogued", news.length >= 4);

console.log(fail ? `\nElevation sweep FAILED (${fail} groups)` : "\nElevation sweep OK · branding · pricing · copy · blog · related");
process.exit(fail ? 1 : 0);
