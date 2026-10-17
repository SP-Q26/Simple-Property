#!/usr/bin/env node
/**
 * Copy swarm · ROI · expansion · automation lanes on core marketing surfaces.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  VALUE_ROI_LINE,
  VALUE_EXPANSION_LINE,
  VALUE_AUTOMATION_LINE,
} from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

function need(label, ok) {
  if (!ok) {
    console.error("COPY SWARM FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const index = read("index.html");
const pricing = read("pricing.html");
const launch = read("launch-stack.html");
const modules = read("modules.html");
const llms = read("llms.txt");

need("index ROI line", index.includes(VALUE_ROI_LINE));
need("pricing ROI line", pricing.includes(VALUE_ROI_LINE));
need("pricing counsel anchor", /350/.test(pricing) && /counsel|lawyer/i.test(pricing));
need("launch-stack counsel ROI", /350/.test(launch) || launch.includes(VALUE_ROI_LINE));

need("index expansion lane", index.includes(VALUE_EXPANSION_LINE));
need("launch-stack expansion lane", launch.includes(VALUE_EXPANSION_LINE));
need("llms expansion tiers", llms.includes("1–10") && llms.includes("20–40"));

need("index automation lane", index.includes(VALUE_AUTOMATION_LINE));
need("pricing automation lane", pricing.includes(VALUE_AUTOMATION_LINE));
need("modules automation lane", modules.includes(VALUE_AUTOMATION_LINE));
need("launch-stack automation mention", /automate|reminders|Calendar/i.test(launch));

console.log(fail ? `\nCopy swarm lanes FAILED (${fail})` : "\nCopy swarm lanes OK");
process.exit(fail ? 1 : 0);
