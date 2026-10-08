#!/usr/bin/env node
/**
 * Sync brand tag + sp-nav LOCALES from web/lib/deposit-rules.mjs + brand-locale.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BRAND_TAG,
  BRAND_TAGLINE,
  BRAND_TAG_HTML,
  HERO_EYEBROW,
  localeNavEntries,
  COVERAGE_MAP_XY,
  STATE_ONLY_COUNT,
  METRO_NAV,
} from "../web/lib/brand-locale.mjs";

const COVERAGE_LABEL = `${STATE_ONLY_COUNT} states + DC`;
const COVERAGE_PLUS = `${STATE_ONLY_COUNT} states plus DC`;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");

const OLD_TAGS = [
  "Itemize it. Date it. Keep the clock. · IL · IN · OH · MI · IA · MO",
  "Itemize it. Date it. Keep the clock. · 19 states + DC · Chicago RLTO",
  "Itemize it. Date it. Keep the clock. · 18 states + DC · Chicago RLTO",
  "Itemize it. Date it. Keep the clock. · Founded in Chicago · 18 states + DC",
  "Itemize it. Date it. Keep the clock. · 20 states + DC · Chicago RLTO",
  "Itemize it. Date it. Beat the clock. · Founded in Chicago · 18 states + DC",
  `Itemize it. Date it. Beat the clock. · Founded in Chicago · 19 states + DC`,
  "Itemize it. Date it. Beat the clock. · 18 states + DC",
  `Itemize it. Date it. Beat the clock. · ${STATE_ONLY_COUNT - 1} states + DC`,
  `Itemize it. Date it. Beat the clock. · Founded in Chicago · ${STATE_ONLY_COUNT} states + DC`,
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

function applyLocaleCopy(html) {
  let next = html;
  for (const old of OLD_TAGS) {
    next = next.split(old).join(BRAND_TAG);
  }
  next = next.split("Itemize it. Date it. Keep the clock.").join(BRAND_TAGLINE);
  next = next.split("Itemize it. Date it. Beat the clock.").join(BRAND_TAGLINE);
  next = next.replaceAll("18 states + DC", COVERAGE_LABEL);
  next = next.replaceAll("18 states plus DC", COVERAGE_PLUS);
  if (next.includes('class="hero-eyebrow"') && next.includes("Security deposit return ·")) {
    next = next.replace(/<p class="hero-eyebrow">[^<]*<\/p>/, `<p class="hero-eyebrow">${HERO_EYEBROW}</p>`);
  }
  if (!next.includes("brand-tag__mobile")) {
    next = next.replaceAll(`<span class="brand-tag">${BRAND_TAG}</span>`, BRAND_TAG_HTML);
  }
  return next;
}

let htmlChanged = 0;
for (const file of walkHtml(web)) {
  const html = readFileSync(file, "utf8");
  const next = applyLocaleCopy(html);
  if (next !== html) {
    writeFileSync(file, next);
    htmlChanged++;
  }
}

const shellHeader = join(web, "brand/shell-header.html");
if (existsSync(shellHeader)) {
  let sh = readFileSync(shellHeader, "utf8");
  const next = applyLocaleCopy(sh);
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
const mapJson = JSON.stringify(COVERAGE_MAP_XY, null, 2).replace(/\n/g, "\n  ");
const mapBlock = `  var MAP_XY = ${mapJson.replace(/^  /, "")};`;
nav = nav.replace(/  var MAP_XY = \{[\s\S]*?\};/, mapBlock);
const metroJson = JSON.stringify(METRO_NAV, null, 2).replace(/\n/g, "\n  ");
const metroBlock = `  var METRO_NAV = ${metroJson.replace(/^  /, "")};`;
nav = nav.replace(/  var METRO_NAV = \[[\s\S]*?\];/, metroBlock);
nav = nav.replace(
  /Official deposit statutes<\/a> · \d+ states \+ DC/,
  `Official deposit statutes</a> · ${STATE_ONLY_COUNT} states + DC`
);
writeFileSync(navPath, nav);

console.log(`sync-brand-locale · ${htmlChanged} html · sp-nav`);
console.log("BRAND_TAG:", BRAND_TAG);
