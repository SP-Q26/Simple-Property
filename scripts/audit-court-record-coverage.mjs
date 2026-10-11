#!/usr/bin/env node
/** Court-record JSON + blog card coverage for wizard states and metro presets. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const dataPath = join(web, "data", "court-record-snippets.json");
let fail = 0;

function ding(msg) {
  console.error("FAIL court-record:", msg);
  fail++;
}

if (!existsSync(dataPath)) {
  ding("missing web/data/court-record-snippets.json — run build-court-record-snippets.mjs");
  process.exit(1);
}

const data = JSON.parse(readFileSync(dataPath, "utf8"));
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));

const byState = Object.fromEntries(SUPPORTED_STATES.map((c) => [c, 0]));
for (const s of data.snippets || []) {
  for (const code of s.states || []) {
    if (byState[code] !== undefined) byState[code]++;
  }
}
for (const [code, n] of Object.entries(byState)) {
  if (n < 2) ding(`${code} has ${n} snippet(s), need ≥2`);
}

const metroPresets = new Set(
  manifest.posts.map((p) => p.cityPreset).filter(Boolean)
);
const metroCovered = new Set();
for (const s of data.snippets || []) {
  for (const m of s.metros || []) metroCovered.add(m);
}
for (const m of metroPresets) {
  if (!metroCovered.has(m)) ding(`manifest cityPreset ${m} has no metro snippet`);
}

const blogDir = join(web, "blog");
let missingCard = 0;
for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html")) {
  const html = readFileSync(join(blogDir, file), "utf8");
  if (!html.includes("data-spt-court-card")) missingCard++;
  if (!html.includes("court-record-rotate.js")) missingCard++;
}
if (missingCard) ding(`${missingCard} blog HTML files missing court card or rotate script — run refresh-all-blog-shells.mjs`);

if (!existsSync(join(web, "court-record-rotate.js"))) ding("missing web/court-record-rotate.js");
if (existsSync(join(web, "blog-court-rotate.js")) || existsSync(join(web, "hero-rotate.js"))) {
  ding("remove legacy hero-rotate.js / blog-court-rotate.js (use court-record-rotate.js)");
}

console.log(
  fail
    ? `audit-court-record-coverage FAILED (${fail})`
    : `audit-court-record-coverage OK · ${data.snippets.length} snippets · ${metroPresets.size} metros`
);
process.exit(fail ? 1 : 0);
