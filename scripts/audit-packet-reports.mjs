#!/usr/bin/env node
/** Print packet + AI report + marketing sample parity gates. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("PACKET REPORT FAIL:", label);
    fail++;
  } else console.log("ok", label);
}

const index = readFileSync(join(web, "index.html"), "utf8");
const report = readFileSync(join(web, "lib/packet-report.mjs"), "utf8");
const app = readFileSync(join(web, "app.js"), "utf8");

need("packet-report.mjs exists", existsSync(join(web, "lib/packet-report.mjs")));
need("app imports shared print report", app.includes("buildPrintPacketInnerHtml") && app.includes("packet-report.mjs"));
need("ai report re-exports packet-report", readFileSync(join(web, "lib/packet-ai-report.mjs"), "utf8").includes("packet-report.mjs"));
need("report 32 states copy", report.includes("32 states + DC"));
need("report itemized deductions heading", report.includes("Itemized deductions"));
need("sample Itemized deductions", index.includes("Itemized deductions"));
need("sample Chicago RLTO deadline", index.includes("Chicago RLTO") && index.includes("Return or itemize"));
need("sample packet id format", index.includes("Packet a3f9c812"));
need("sample product email only", index.includes("hello@simple-property.com") && !index.includes("@gmail"));
need("google sheets return column", readFileSync(join(web, "lib/google-tools.mjs"), "utf8").includes("Return to tenant"));

const nav = readFileSync(join(web, "sp-nav.js"), "utf8");
need("metro nav more tray", nav.includes("METRO_NAV_MORE") && nav.includes("metro-nav-more"));

console.log(fail ? `audit-packet-reports FAILED (${fail})` : "audit-packet-reports OK");
process.exit(fail ? 1 : 0);
