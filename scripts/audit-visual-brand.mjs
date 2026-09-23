#!/usr/bin/env node
/** Spacing · typography · pricing UX · gold + quant blue gates. */
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
const app = read("app.js");

need("css v33 on home", index.includes("simple-property.css?v=33"));
need("quant blue card wash", css.includes("--quant-blue-surface"));
need("gold accent tokens", css.includes("--beam-gold") && css.includes(".btn-primary"));
need("fact strip gold + blue", css.includes("border-top: 3px solid var(--beam-gold)") && css.includes(".fact-strip"));
need("wizard step gold active", css.includes(".wizard-steps span.active") && css.includes("var(--accent)"));
need("form panel quant surface", css.includes(".form-panel") && css.includes("quant-blue-surface"));
need("greystone pilasters", css.includes(".spt-greystone-pilaster"));
need("metal door panel", css.includes("#454b52") && css.includes(".spt-door-swing"));
need("weather mist layer", css.includes(".spt-weather-mist"));
need("regal SP swing door", css.includes(".spt-door-swing") && css.includes(".spt-door-monogram") && index.includes("spt-greystone-pilaster"));
need("hero door art asset", index.includes("spt-hero-door.svg") && index.includes("hero-door-mark"));
need("weather speckle layer", css.includes(".spt-weather") && index.includes("spt-weather-mist"));
need("locale bar + coverage bubbles", css.includes(".locale-bar") && css.includes(".coverage-bubble--45"));
need("spacing scale", css.includes("--space-8") && css.includes("--page-max"));
need("display + UI fonts", css.includes("--font-display") && css.includes("Lora"));
need("pricing wide layout", css.includes(".pricing-page"));
need("sleek price cards", css.includes(".price-card") && css.includes("price-card__badge"));
need("pricing finder", pricing.includes("pricing-finder") && existsSync(join(web, "sp-pricing-finder.js")));
need("pricing card grid", pricing.includes("pricing-cards"));
need("pathway deck on home", index.includes("pathway-deck") && index.includes("/feedback"));
need("deposit receipt sample", index.includes("deposit-receipt") && index.includes("Move-in condition"));
need("brand tag on pricing", pricing.includes("Keep the clock"));
need("pro units 40 in pricing", pricing.includes("40"));
need("photo link fields app", app.includes("photoAlbumLink") && app.includes("room-photo-link"));
need("photo link fields logs", read("logs.js").includes("photoLinks") && css.includes(".external-photo-link"));

console.log(fail ? `\nVisual brand audit FAILED (${fail})` : "\nVisual brand audit OK");
process.exit(fail ? 1 : 0);
