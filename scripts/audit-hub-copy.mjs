#!/usr/bin/env node
/** Condition hub · customer voice (no backend jargon on public surfaces). */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { HUB_PRODUCT_NAME } from "../web/lib/hub-copy.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("HUB COPY FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

const hubHtml = read("hub.html");
const modules = read("modules.html");
const hubApp = read("hub-app.js");
const hubCopy = read("lib/hub-copy.mjs");
const htmlVisible = `${hubHtml}\n${modules}`;
const appUi = hubApp.replace(/^import\s.+$/gm, "").replace(/from\s+["'].+["'];?/g, "");

const FORBIDDEN_HTML = [
  ["template_id", /\btemplate_id\b/i],
  ["Receipt Rail", /\bReceipt Rail\b/i],
  ["org spine", /\borg spine\b/i],
  ["P1/P2 label", /\bP[1-6]\b/],
  ["hub alpha", /hub alpha/i],
  ["internal template ids", /\bmove_in_baseline\b|\bmove_out_condition\b/],
];

const FORBIDDEN_APP = [
  ["template_id in UI", /\btemplate_id\b/i],
  ["Receipt Rail in UI", /\bReceipt Rail\b/i],
  ["FIX_LIST in UI", /\bFIX_LIST\b/],
  ["hookup", /\bhookup\b/i],
  ["Train N", /\bTrain \d\b/i],
  ["SKU", /\bSKU\b/i],
  ["Vault nav label", />\s*Vault\s*</i],
];

for (const [label, re] of FORBIDDEN_HTML) {
  need(`html: no ${label}`, !re.test(htmlVisible));
}
for (const [label, re] of FORBIDDEN_APP) {
  need(`hub-app: no ${label}`, !re.test(appUi));
}

need("product name in copy module", hubCopy.includes(HUB_PRODUCT_NAME));
need("hub title customer", hubHtml.includes("Condition hub"));
need("modules pain framing", modules.includes("ps-problem") && modules.includes("ps-fix"));
need("hub app pain framing", hubApp.includes("ps-problem") && hubApp.includes("ps-fix"));
need("modules not legal advice", /not legal advice/i.test(modules));
need("unit picker route", hubApp.includes("renderPickUnit"));
need("verdict labels human", hubApp.includes("verdictLabel"));

console.log(fail ? `\nHub copy audit FAILED (${fail})` : "\nHub copy audit OK");
process.exit(fail ? 1 : 0);
