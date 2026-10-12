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
need("wizard finishWizard", app.includes("function finishWizard"));
need("wizard done on max step", /step >= MAX_STEPS[\s\S]{0,120}finishWizard/.test(app));
need("screen packet preview section", app.includes("packet-screen-preview"));
need("renderScreenPacketPreview", app.includes("function renderScreenPacketPreview"));
const css = readFileSync(join(web, "simple-property.css"), "utf8");
need("screen preview CSS", css.includes(".packet-screen-preview__body"));
need("screen preview not hidden", css.includes(".print-packet--screen") && css.includes(":not(.print-packet--screen)"));
need("screen preview no print watermark", css.includes(".packet-screen-preview__body::after") && css.includes("content: none"));
need("export step full itemization", app.includes("renderItemizationPreview(false)"));
need("export step preview refresh", app.includes("refreshExportStepPreviews") && app.includes("data-spt-preview-body"));
need("print preview readable on screen", css.includes("body.spt-print-preview"));

const nav = readFileSync(join(web, "sp-nav.js"), "utf8");
need("metro nav more tray", nav.includes("METRO_NAV_MORE") && nav.includes("metro-nav-more"));

console.log(fail ? `audit-packet-reports FAILED (${fail})` : "audit-packet-reports OK");
process.exit(fail ? 1 : 0);
