#!/usr/bin/env node
/** Brand shell P0 — lockup · Deposit Desk tag · css v8 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const BRAND_TAG = "Itemize it. Date it. Keep the clock. · Founded in Chicago · 18 states + DC";
const CSS_PATTERN = /simple-property\.css\?v=\d+/;
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

const files = walkHtml(web);

for (const file of files) {
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  if (!html.includes("brand-mark")) {
    console.error("BRAND FAIL missing brand-mark:", rel);
    fail++;
  }
  if (!html.includes(BRAND_TAG)) {
    console.error("BRAND FAIL missing brand tag:", rel);
    fail++;
  }
  if (!CSS_PATTERN.test(html)) {
    console.error("BRAND FAIL missing versioned css:", rel);
    fail++;
  }
  if (html.includes("Homestead")) {
    console.error("BRAND FAIL legacy Homestead copy:", rel);
    fail++;
  }
  if (!html.includes("header-nav") && !rel.startsWith("brand/")) {
    console.error("BRAND FAIL missing header nav:", rel);
    fail++;
  }
}

if (existsSync(join(web, "brand/shell-header.html"))) {
  const shell = readFileSync(join(web, "brand/shell-header.html"), "utf8");
  if (!shell.includes(BRAND_TAG)) {
    console.error("BRAND FAIL shell-header outdated");
    fail++;
  }
}

console.log(fail ? `Brand audit FAILED (${fail})` : "Brand audit OK · shell v14");
process.exit(fail ? 1 : 0);
