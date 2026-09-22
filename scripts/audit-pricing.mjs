#!/usr/bin/env node
/** Pricing copy ↔ catalog ↔ app cap alignment. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

const pricing = read("pricing.html");
const app = read("app.js");
const catalog = read("lib/stripe-catalog.mjs");
const limits = read("lib/pro-limits.mjs");

function need(label, ok) {
  if (!ok) {
    console.error("PRICING FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const maxMatch = limits.match(/PRO_UNITS_MAX\s*=\s*(\d+)/);
const cap = maxMatch ? Number(maxMatch[1]) : 0;

need("PRO_UNITS_MAX defined", cap === 40);
need("catalog metadata spt_units_max", catalog.includes("spt_units_max: UNITS_META") || catalog.includes('spt_units_max: "40"'));
need("app imports pro-limits", app.includes("pro-limits.mjs"));
need("app canExportPro gate", app.includes("canExportPro"));
need("pricing states 40 units", pricing.includes("40 units") || pricing.includes("40</td>"));
need("pricing card deck", pricing.includes("pricing-cards") && pricing.includes("price-card"));
need("pricing finder UI", pricing.includes("pricing-finder") && pricing.includes("pf-units"));
need("pricing annual value", pricing.includes("$99"));
need("pricing monthly $22", pricing.includes("$22"));
need("pricing print export", pricing.includes("Print / Save as PDF"));
need("print gate in app", app.includes("spt-no-pro-print"));
need("pricing per-turn checkout", pricing.includes("Unlock at step 5") || pricing.includes("unlock at export"));
need("catalog turn_move_out", catalog.includes("turn_move_out"));
need("catalog turn_full", catalog.includes("turn_full"));
need(
  "checkout packet_id",
  read("api/stripe/checkout.js").includes("spt_packet_id") &&
    read("api/stripe/checkout.js").includes("catalog.mode")
);
need("home per-turn model", read("index.html").includes("per turn") || read("index.html").includes("Per turn"));
need("gospel pricing 22/99", read(".well-known/spt-gospel.json").includes('"monthly_usd": 22'));
need("terms mention prices", existsSync(join(web, "terms.html")) && read("terms.html").includes("$22"));

console.log(fail ? `\nPricing audit FAILED (${fail})` : "\nPricing audit OK");
process.exit(fail ? 1 : 0);
