#!/usr/bin/env node
/** Font stack · Google link · cache version on core pages. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FONT_GOOGLE, CSS_VERSION } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("FONT FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const css = readFileSync(join(web, "simple-property.css"), "utf8");
need("css Source Sans 3", css.includes("Source Sans 3"));
need("css Source Serif 4 display", css.includes("Source Serif 4"));
need(`css v${CSS_VERSION} comment`, css.includes(`v${CSS_VERSION}`));

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

const sample = ["index.html", "app.html", "terms.html", "blog/index.html"];
for (const rel of sample) {
  const h = readFileSync(join(web, rel), "utf8");
  need(`${rel} Google fonts`, h.includes("Source+Sans+3") || h.includes(encodeURIComponent("Source Sans 3").replace(/%20/g, "+")));
  need(`${rel} css v${CSS_VERSION}`, h.includes(`simple-property.css?v=${CSS_VERSION}`));
  need(`${rel} no Inter stack`, !h.includes("family=Inter"));
}

let interLeft = 0;
for (const file of walkHtml(web)) {
  const h = readFileSync(file, "utf8");
  if (h.includes("family=Inter")) interLeft++;
}
need("no Inter font links sitewide", interLeft === 0);

console.log(fail ? `\nFont audit FAILED (${fail})` : "\nFont audit OK");
process.exit(fail ? 1 : 0);
