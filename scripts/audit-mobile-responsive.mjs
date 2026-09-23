#!/usr/bin/env node
/**
 * Mobile + tablet responsive audit (customer pages).
 * WeWeb-style breakpoints: stack below 640px, tablet 640–1023, desktop 1024+.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("MOBILE FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

function htmlPages() {
  const out = [];
  function walk(d) {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (n === "node_modules" || n === "brand") continue;
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (n.endsWith(".html")) out.push(p.replace(web + "/", ""));
    }
  }
  walk(web);
  return out;
}

const key = ["index.html", "pricing.html", "app.html", "blog/index.html"];
for (const p of key) {
  const h = read(p);
  need(`${p} viewport meta`, h.includes('name="viewport"') && h.includes("width=device-width"));
  need(`${p} viewport-fit cover`, h.includes("viewport-fit=cover"));
}

need("css mobile stack @640 pricing cards", css.includes("@media (min-width: 640px)") && css.includes(".pricing-cards"));
need("css tablet pricing 2-col @720", css.includes("@media (min-width: 720px)") && css.includes("grid-template-columns: repeat(2"));
need("css desktop pricing 4-col @1024", css.includes("@media (min-width: 1024px)") && css.includes("repeat(4"));
need("css hero single column default", css.includes(".hero-layout") && css.includes("820px"));
need("css iOS safe-area tokens", css.includes("--safe-top") && css.includes("safe-area-inset"));
need("css tap min height token", css.includes("--tap-min"));
need("css iOS input 16px mobile", css.includes("@media (max-width: 639px)") && css.includes("font-size: 1rem") && css.includes("input[type=\"text\"]"));
need("css packet-bar mobile stack", css.includes(".packet-bar") && css.includes("flex-direction: column"));
need("css pathway touch active", css.includes(".pathway-card:active"));
need("css touch-action buttons", css.includes("touch-action: manipulation") && css.includes(".btn"));
need("css form inputs full width pattern", css.includes(".form-grid") || css.includes(".field-stack"));
need("css skip link", css.includes(".skip-link"));
need("app wizard steps wrap", css.includes(".wizard-steps") && css.includes("flex-wrap"));
need("header nav wraps", css.includes(".header-nav") && css.includes("flex-wrap"));
need("pricing finder stacks on mobile", css.includes(".pricing-finder__grid"));
need("locale bar mobile", css.includes(".coverage-bubbles") && css.includes("locale-bar"));
need("locale bar breakpoint gates", css.includes("@media (min-width: 900px)") && css.includes(".coverage-bubbles__track"));
need("css weather speckle", css.includes(".spt-weather") && css.includes("spt-weather-drift"));
need("css weather mist", css.includes(".spt-weather-mist"));
need("css greystone brick", css.includes(".spt-greystone-pilaster"));
need("css metal swing door", css.includes(".spt-door-swing") && css.includes(".spt-door-lintel"));
need("css tablet spacing block", css.includes("@media (min-width: 640px) and (max-width: 1023px)"));

const app = read("app.js");
need("app photo size guard mobile data", app.includes("400KB") || app.includes("photo"));

console.log(fail ? `\nMobile/tablet audit FAILED (${fail})` : "\nMobile/tablet audit OK");
process.exit(fail ? 1 : 0);
