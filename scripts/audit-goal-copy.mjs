#!/usr/bin/env node
/**
 * Goal-oriented copy · pain → fix → clear CTA on core customer surfaces.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { VALUE_ROI_LINE } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

function need(label, ok) {
  if (!ok) {
    console.error("GOAL COPY FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const ACTION = /\b(Start|Open|Try|Continue|Get|See pricing|Download|Submit|Lock|Walk)\b/i;

/** @type {{ rel: string, bundle?: string[] }[]} */
const SURFACES = [
  { rel: "index.html" },
  { rel: "pricing.html" },
  { rel: "app.html" },
  { rel: "logs.html" },
  { rel: "modules.html" },
  { rel: "launch-stack.html" },
  { rel: "feedback.html" },
  { rel: "success.html" },
  { rel: "blog/index.html" },
  { rel: "legal.html" },
  { rel: "hub.html", bundle: ["hub-app.js"] },
];

for (const { rel, bundle = [] } of SURFACES) {
  let html = read(rel);
  for (const extra of bundle) html += "\n" + read(extra);
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  need(`${rel} pain block`, visible.includes("ps-problem"));
  need(`${rel} fix block`, visible.includes("ps-fix") || visible.includes("pain-solution-lead"));
  need(`${rel} primary CTA`, /btn-primary/.test(visible) || (rel === "app.html" && visible.includes("wizard-steps")));
  need(`${rel} action verb`, ACTION.test(visible));
  need(`${rel} not legal advice`, /not legal advice/i.test(visible));
}

need("index ROI line", read("index.html").includes(VALUE_ROI_LINE));
need("pricing ROI line", read("pricing.html").includes(VALUE_ROI_LINE));

const jargon = [
  ["feedback no ruleset headline", !/\brulesets\b/i.test(read("feedback.html").replace(/<title[\s\S]*?<\/title>/i, ""))],
  ["legal no ruleset in hub list", !read("legal.html").includes("rulesets")],
  ["modules customer hub name", read("modules.html").includes("Condition hub")],
  ["hub static intro", read("hub.html").includes("ps-problem")],
  ["blog hub CTA button", read("blog/index.html").includes("btn-primary")],
  ["success open desk CTA", read("success.html").includes("Open Deposit Desk")],
  ["app plain step hint", read("app.html").includes("Five steps")],
];

for (const [label, ok] of jargon) need(label, ok);

console.log(fail ? `\nGoal copy audit FAILED (${fail})` : "\nGoal copy audit OK");
process.exit(fail ? 1 : 0);
