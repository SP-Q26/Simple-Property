#!/usr/bin/env node
/** Brand shell P0 — lockup · Deposit Desk tag · css v8 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const BRAND_TAG = "Itemize it. Date it. Keep the clock. · IL · IN · OH · MI · IA · MO";
const CSS = "simple-property.css?v=12";
let fail = 0;

function htmlFiles(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => join(dir, f));
}

const files = [...htmlFiles(web), ...htmlFiles(join(web, "blog"))];

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
  if (!html.includes(CSS)) {
    console.error("BRAND FAIL css not v8:", rel);
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

console.log(fail ? `Brand audit FAILED (${fail})` : "Brand audit OK · shell v12");
process.exit(fail ? 1 : 0);
