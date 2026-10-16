#!/usr/bin/env node
/** Every public HTML page ships Vercel Analytics + sp-events bus. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "brand" || name === "node_modules") continue;
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function need(label, ok) {
  if (!ok) {
    console.error("ANALYTICS COVERAGE FAIL:", label);
    fail++;
  }
}

const files = walkHtml(web);
for (const file of files) {
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  need(`${rel} insights`, html.includes("/_vercel/insights/script.js"));
  need(`${rel} speed insights`, html.includes("/_vercel/speed-insights/script.js"));
  need(`${rel} sp-events`, html.includes("/sp-events.js"));
}

console.log(`checked ${files.length} html files`);
console.log(fail ? `\nAnalytics coverage FAILED (${fail})` : "\nAnalytics coverage OK");
process.exit(fail ? 1 : 0);
