#!/usr/bin/env node
/** Google Workspace alignment audit · 1-click calendar · Sheets CSV · docs canon. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function ok(msg) {
  console.log("ok:", msg);
}
function bad(msg) {
  console.error("GOOGLE FAIL:", msg);
  fail++;
}

const lib = join(web, "lib/google-tools.mjs");
if (!existsSync(lib)) bad("missing web/lib/google-tools.mjs");
else {
  const src = readFileSync(lib, "utf8");
  if (!src.includes("googleCalendarAddUrl")) bad("googleCalendarAddUrl missing");
  else ok("google-tools.mjs · Calendar template URL");
  if (!src.includes("buildPacketSheetsCsv")) bad("buildPacketSheetsCsv missing");
  else ok("google-tools.mjs · Sheets CSV export");
}

const app = readFileSync(join(web, "app.js"), "utf8");
if (!app.includes("google-tools.mjs")) bad("app.js must import google-tools");
else ok("app.js imports google-tools");
if (!app.includes("btn-google-cal")) bad("app step 5 missing Google Calendar button");
else ok("wizard · Add to Google Calendar");
if (!app.includes("btn-sheets-csv")) bad("app step 5 missing Sheets CSV button");
else ok("wizard · Google Sheets CSV export");
if (!app.includes("btn-ics")) bad("app step 5 missing .ics download");
else ok("wizard · .ics (Calendar import)");

const index = readFileSync(join(web, "index.html"), "utf8");
if (!index.includes("Google Calendar") && !index.includes("Google Sheets")) {
  bad("index.html should mention Google Calendar or Sheets");
} else ok("home · Google tools called out");

const stack = readFileSync(join(web, "launch-stack.html"), "utf8");
if (!stack.includes("Google")) bad("launch-stack should reference Google tools row");
else ok("launch-stack · Google alignment");

if (!existsSync(join(root, "docs/GOOGLE_TOOLS_AUDIT.md"))) bad("missing docs/GOOGLE_TOOLS_AUDIT.md");
else ok("GOOGLE_TOOLS_AUDIT.md canon");

console.log(fail ? `\nGoogle tools audit FAILED (${fail})` : "\nGoogle tools audit OK");
process.exit(fail ? 1 : 0);
