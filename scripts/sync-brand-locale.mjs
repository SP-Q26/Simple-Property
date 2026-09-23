#!/usr/bin/env node
/**
 * Sync brand tag + sp-nav LOCALES from web/lib/deposit-rules.mjs + brand-locale.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_TAG, localeNavEntries } from "../web/lib/brand-locale.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");

const OLD_TAGS = [
  "Itemize it. Date it. Keep the clock. · IL · IN · OH · MI · IA · MO",
  "Itemize it. Date it. Keep the clock. · 19 states + DC · Chicago RLTO",
  "Itemize it. Date it. Keep the clock. · 18 states + DC · Chicago RLTO",
  "Itemize it. Date it. Keep the clock. · 20 states + DC · Chicago RLTO",
];

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

let htmlChanged = 0;
for (const file of walkHtml(web)) {
  let html = readFileSync(file, "utf8");
  let next = html;
  for (const old of OLD_TAGS) {
    next = next.split(old).join(BRAND_TAG);
  }
  if (next !== html) {
    writeFileSync(file, next);
    htmlChanged++;
  }
}

const shellHeader = join(web, "brand/shell-header.html");
if (existsSync(shellHeader)) {
  let sh = readFileSync(shellHeader, "utf8");
  let next = sh;
  for (const old of OLD_TAGS) {
    next = next.split(old).join(BRAND_TAG);
  }
  if (next !== sh) {
    writeFileSync(shellHeader, next);
    console.log("updated brand/shell-header.html");
  }
}

const navPath = join(web, "sp-nav.js");
let nav = readFileSync(navPath, "utf8");
const localesJson = JSON.stringify(localeNavEntries(), null, 2).replace(/\n/g, "\n  ");
const localesBlock = `  var LOCALES = ${localesJson.replace(/^  /, "")};`;
nav = nav.replace(/  var LOCALES = \[[\s\S]*?\];/, localesBlock);
writeFileSync(navPath, nav);

const auditBrand = join(root, "scripts/audit-brand-shell.mjs");
let audit = readFileSync(auditBrand, "utf8");
audit = audit.replace(
  /const BRAND_TAG = "[^"]+";/,
  `const BRAND_TAG = ${JSON.stringify(BRAND_TAG)};`
);
writeFileSync(auditBrand, audit);

console.log(`sync-brand-locale · ${htmlChanged} html · sp-nav · audit-brand-shell`);
console.log("BRAND_TAG:", BRAND_TAG);
