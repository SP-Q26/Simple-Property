#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("FUNNEL FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const events = readFileSync(join(web, "api/events.js"), "utf8");
const rollups = readFileSync(join(web, "lib/funnel-rollups.mjs"), "utf8");
const webhook = readFileSync(join(web, "api/stripe/webhook.js"), "utf8");
const ops = readFileSync(join(web, "lib/ops-routes.mjs"), "utf8");
const cron = readFileSync(join(web, "lib/cron-jobs.mjs"), "utf8");
const doc = readFileSync(join(root, "docs/receipt-rail/SIMPLE_PROPERTY_TELEMETRY_PBS_v1.md"), "utf8");

need("events records funnel", events.includes("recordFunnelEvent"));
need("rollups checkout_complete allowed", rollups.includes('"checkout_complete"'));
need("webhook rollup", webhook.includes("recordFunnelEvent"));
need("funnel report route", ops.includes("handleFunnelReport"));
need("funnel weekly cron", cron.includes("spt_funnel_weekly"));
need("spec sink mentions KV", doc.includes("KV") || doc.includes("funnel"));
need("server telemetry helper", readFileSync(join(web, "lib/server-telemetry.mjs"), "utf8").includes("recordServerFunnel"));

console.log(fail ? `\nFunnel rollup audit FAILED (${fail})` : "\nFunnel rollup audit OK");
process.exit(fail ? 1 : 0);
