#!/usr/bin/env node
/** Brand shell P0 — every public HTML page uses Homestead lockup + css v6 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
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
  if (!html.includes("Homestead")) {
    console.error("BRAND FAIL missing Homestead line:", rel);
    fail++;
  }
  if (!html.includes("simple-property.css?v=7")) {
    console.error("BRAND FAIL css not v7:", rel);
    fail++;
  }
  if (!html.includes("header-nav") && !rel.startsWith("brand/")) {
    console.error("BRAND FAIL missing header nav:", rel);
    fail++;
  }
}

if (existsSync(join(web, "brand/shell-header.html"))) {
  const shell = readFileSync(join(web, "brand/shell-header.html"), "utf8");
  if (!shell.includes("brand-text")) {
    console.error("BRAND FAIL shell-header outdated");
    fail++;
  }
}

console.log(fail ? `Brand audit FAILED (${fail})` : "Brand audit OK · shell v7");
process.exit(fail ? 1 : 0);
