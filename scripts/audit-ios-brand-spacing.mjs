#!/usr/bin/env node
/**
 * iOS-first brand + spacing audit (46% iOS traffic · Safari WebKit).
 * Run: node scripts/audit-ios-brand-spacing.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
const EM = "\u2014";
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("IOS BRAND FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

const pages = ["index.html", "app.html", "pricing.html", "blog/index.html", "feedback.html"];
for (const p of pages) {
  const h = read(p);
  need(`${p} viewport-fit=cover`, h.includes("viewport-fit=cover"));
  need(`${p} versioned css`, /simple-property\.css\?v=\d+/.test(h));
  if (h.includes(EM)) need(`${p} no em dash`, false);
}

need("css v29 header", css.includes("v29"));
need("css apple system stack", css.includes("-apple-system"));
need("css safe-area tokens", css.includes("--safe-top") && css.includes("safe-area-inset-bottom"));
need("css text-size-adjust", css.includes("-webkit-text-size-adjust: 100%"));
need("css tap-min 44px class", css.includes("--tap-min: 2.75rem"));
need("css iOS input 16px", css.includes("@media (max-width: 639px)") && css.includes("font-size: 1rem"));
need("css mobile page safe padding", css.includes("max(var(--space-3), var(--safe-right))"));
need("css coverage bubbles", css.includes(".coverage-bubbles") && css.includes(".coverage-bubble--30"));
need("css coverage tap target", css.includes(".coverage-bubble") && css.includes("min-height: var(--tap-min)"));
need("css locale bar pointer-events", css.includes(".locale-bar") && css.includes("pointer-events: auto"));
need("css webkit touch callout block", css.includes("-webkit-touch-callout: none"));
need("css coverage relative map", css.includes(".coverage-bubbles--relative") && css.includes(".coverage-region__row"));
need("css locale list fallback", css.includes(".locale-bar__list-fallback"));
need("css mobile locale map full width", css.includes(".locale-bar__map-wrap") && css.includes("max-width: none"));
need("css mobile hero stack spacing", css.includes(".hero-actions") && css.includes("flex-direction: column"));
need("css mobile deposit receipt scroll", css.includes(".deposit-receipt") && css.includes("-webkit-overflow-scrolling: touch"));
need("css touch-action buttons", css.includes("touch-action: manipulation"));
need("css brand tag mobile shrink", css.includes(".brand-tag") && css.includes("font-size: 0.72rem"));
need("css spacing scale", css.includes("--space-5") && css.includes("--space-6"));
need("css quant + gold brand", css.includes("--beam-gold") && css.includes("--quant-blue-surface"));
need("sp-nav coverage bubble builder", read("sp-nav.js").includes("coverage-bubbles--relative") && read("sp-nav.js").includes("wireAppPreset"));
need("home hero caption clean", read("index.html").includes("Deposit Desk · start free") && !read("index.html").toLowerCase().includes("link preview"));

function walkHtml(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (n === "node_modules" || n === "brand") continue;
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (n.endsWith(".html")) out.push(p);
  }
  return out;
}

const versions = new Set();
for (const f of walkHtml(web)) {
  const m = readFileSync(f, "utf8").match(/simple-property\.css\?v=(\d+)/);
  if (m) versions.add(m[1]);
}
need("single css cache version sitewide", versions.size === 1);
if (versions.size === 1) console.log("ok: css cache v" + [...versions][0]);

console.log(fail ? `\niOS brand/spacing audit FAILED (${fail})` : "\niOS brand/spacing audit OK");
process.exit(fail ? 1 : 0);
