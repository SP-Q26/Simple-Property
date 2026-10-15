#!/usr/bin/env node
/** Simple Property telemetry · PBS v1 dictionary + PII gate. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("TELEMETRY FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const doc = readFileSync(join(root, "docs/receipt-rail/SIMPLE_PROPERTY_TELEMETRY_PBS_v1.md"), "utf8");
const tele = readFileSync(join(web, "lib/spt-telemetry.mjs"), "utf8");
const events = readFileSync(join(web, "sp-events.js"), "utf8");
const bar = readFileSync(join(web, "lib/packet-bar.mjs"), "utf8");
const app = readFileSync(join(web, "app.js"), "utf8");
const hook = readFileSync(join(web, "api/stripe/webhook.js"), "utf8");

const required = [
  "packet_bar_copy_link",
  "packet_bar_copy_tsv",
  "packet_bar_pdf",
  "packet_bar_ics",
  "sp_wizard_start",
  "sp_finalize_success",
  "checkout_complete",
];

for (const ev of required) {
  need(`spec documents ${ev}`, doc.includes(ev));
}

need("sanitizeTelemetry", tele.includes("sanitizeTelemetry") && tele.includes("receipt_id"));
need("hashReceiptId", tele.includes("hashReceiptId"));
need("trackPacketBar", tele.includes("packet_bar_copy_tsv"));
need("sp-events scrub", events.includes("PII_KEY_RE") && events.includes("checkout_intent"));
const eventsApi = readFileSync(join(web, "api/events.js"), "utf8");
need("api/events sink", eventsApi.includes("spt_telemetry"));
need("api/events funnel rollup", eventsApi.includes("recordFunnelEvent"));
need("spt_hub_handoff_applied spec", doc.includes("spt_hub_handoff_applied") || doc.includes("hub_handoff"));
need(
  "packet bar emits tsv",
  bar.includes("packet_bar_copy_tsv") || /trackPacketBar\(\s*["']copy_tsv/.test(bar)
);
need("app sp_wizard_start", app.includes("sp_wizard_start"));
need("webhook checkout_complete", hook.includes('logEvent("checkout_complete"'));

const forbiddenInApp = ["tenant.email", "landlord.email", "property.street"].some((s) =>
  /trackIsles\([^)]*${s}/.test(app)
);
need("app track no raw address/email", !forbiddenInApp);

console.log(fail ? `\nTelemetry audit FAILED (${fail})` : "\nTelemetry audit OK");
process.exit(fail ? 1 : 0);
