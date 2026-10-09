#!/usr/bin/env node
/** PM stack complement · packet handoff · counsel-hour economics on marketing surfaces. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const app = readFileSync(join(web, "app.js"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("STACK HANDOFF FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const stack = readFileSync(join(web, "launch-stack.html"), "utf8");
const pricing = readFileSync(join(web, "pricing.html"), "utf8");
const llms = readFileSync(join(web, "llms.txt"), "utf8");

need("launch-stack turnover stack section", stack.includes("stack-turnover") && /Innago|Avail/i.test(stack));
need("launch-stack packet json handoff", stack.includes("packet") && stack.includes(".json"));
need("launch-stack deposit desk turnover row", stack.includes("Deposit Desk") && /turnover|move-out/i.test(stack));

need("pricing counsel hour anchor", /350/.test(pricing) && /counsel|lawyer/i.test(pricing));

need("app packet json export", app.includes("download") && app.includes(".json"));
need("app packet import", app.includes("importPacketBackupObject") || app.includes("packet-import"));

need("llms handoff PM complement", llms.includes("handoff") || llms.includes("Innago") || llms.includes("Avail"));
need("llms not PM suite", llms.includes("Not:") && llms.includes("PM"));

console.log(fail ? `\nStack handoff audit FAILED (${fail})` : "\nStack handoff audit OK");
process.exit(fail ? 1 : 0);
