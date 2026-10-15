#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("HUB HANDOFF FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const app = readFileSync(join(web, "app.js"), "utf8");
const ui = readFileSync(join(web, "lib/deposit-desk-handoff-ui.mjs"), "utf8");
const hub = readFileSync(join(web, "lib/hub-desk-handoff.mjs"), "utf8");
const exportM = readFileSync(join(web, "lib/hub-packet-export.mjs"), "utf8");
const hubApp = readFileSync(join(web, "hub-app.js"), "utf8");

need("handoff key canon", hub.includes("spt_hub_desk_handoff_v1"));
need("hub export writes handoff", exportM.includes("writeHubDeskHandoff"));
need("hub app imports write", hubApp.includes("writeHubDeskHandoff"));
need("app consumes handoff", app.includes("consumeConditionHubHandoff"));
need("handoff ui module", readFileSync(join(web, "lib/deposit-desk-handoff-ui.mjs"), "utf8").includes("applyHubDeskHandoffToDraft"));
need("app applies draft", ui.includes("applyHubDeskHandoffToDraft"));
need("telemetry applied event", ui.includes("spt_hub_handoff_applied"));
need("pm handoff sheet", app.includes("pm-handoff-sheet"));

console.log(fail ? `\nHub desk handoff audit FAILED (${fail})` : "\nHub desk handoff audit OK");
process.exit(fail ? 1 : 0);
