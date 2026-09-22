#!/usr/bin/env node
/** Spacing · typography · pricing UX · receipt sample (Innsegall-style gates). */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

function need(label, ok) {
  if (!ok) {
    console.error("VISUAL FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const css = read("simple-property.css");
const pricing = read("pricing.html");
const index = read("index.html");

need("css v13", css.includes("v13") || css.includes("Isles palette"));
need("distant door atmosphere", css.includes(".spt-door-scene") && css.includes("spt-door-left"));
need("isles fjord token", css.includes("--fjord-deep"));
need("locale bar styles", css.includes(".locale-bar") && css.includes(".locale-pill"));
need("spacing scale", css.includes("--space-8") && css.includes("--page-max"));
need("display + UI fonts", css.includes("--font-display") && css.includes("DM Sans"));
need("pricing wide layout", css.includes(".pricing-page"));
need("sleek price cards", css.includes(".price-card") && css.includes("price-card__badge"));
need("pricing finder", pricing.includes("pricing-finder") && existsSync(join(web, "sp-pricing-finder.js")));
need("pricing card grid", pricing.includes("pricing-cards"));
need("deposit receipt sample", index.includes("deposit-receipt") && index.includes("Move-in condition"));
need("brand tag on pricing", pricing.includes("Keep the clock"));
need("pro units 40 in pricing", pricing.includes("40"));

console.log(fail ? `\nVisual brand audit FAILED (${fail})` : "\nVisual brand audit OK");
process.exit(fail ? 1 : 0);
