#!/usr/bin/env node
/**
 * Tool surfaces stay short · positive framing · no agent-facing form copy.
 * Blogs are out of scope (wordy OK).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("BREVITY FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

const NEGATIVE_FRAMING = [
  /\bnot a property management company\b/i,
  /\bnot full property management\b/i,
  /\bnot another PM\b/i,
  /\bnot legal advice\b/i,
  /\bwe do not collect rent\b/i,
  /\bdo not replace your PM\b/i,
  /\bagents:\s*match field order\b/i,
];

function mainSlice(rel) {
  const html = read(rel);
  const m = html.match(/<main[\s\S]*?<\/main>/i);
  return m ? m[0] : html;
}

const toolPages = ["app.html", "hub.html", "logs.html", "feedback.html"];

for (const rel of toolPages) {
  const src = mainSlice(rel);
  for (const re of NEGATIVE_FRAMING) {
    if (re.source.includes("not legal advice")) continue;
    need(`${rel} main avoids negative framing`, !re.test(src));
  }
}

const appJs = read("app.js");
for (const re of NEGATIVE_FRAMING) {
  if (re.source.includes("not legal advice")) continue;
  need(`app.js avoids negative framing`, !re.test(appJs));
}

const appHtml = read("app.html");
need("app intro single beat", !appHtml.includes("ps-problem") && appHtml.includes('id="app-intro"'));
need("app intro hides after step 1", appJs.includes('getElementById("app-intro")'));

need("no step-loss-kicker", !appJs.includes("step-loss-kicker"));
need("no paywallFreeToolsNote", !appJs.includes("paywallFreeToolsNote"));
need("statute details collapsed", appJs.includes("statute-details"));

for (const rel of ["app.html", "feedback.html"]) {
  const hints = [...read(rel).matchAll(/class="field-hint"[^>]*>([\s\S]*?)<\/p>/gi)];
  for (const m of hints) {
    const text = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length > 200) {
      need(`${rel} field-hint under 200 chars`, false);
      break;
    }
  }
  if (hints.length) need(`${rel} field-hint length`, true);
}

console.log(fail ? `\nTool brevity audit FAILED (${fail})` : "\nTool brevity audit OK");
process.exit(fail ? 1 : 0);
