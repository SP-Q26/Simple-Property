#!/usr/bin/env node
/**
 * Performance + memory drain audit · static gates (CSS weight, scripts, atmosphere, paint cost).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION } from "../web/lib/brand-locale.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("PERF FAIL:", label, detail || "");
    fail++;
  } else console.log("ok:", label);
}

const css = read("simple-property.css");
const cssBytes = statSync(join(web, "simple-property.css")).size;

console.log("── Performance audit ──\n");
console.log(`css bytes: ${cssBytes}`);

need(`css v${CSS_VERSION} header`, css.includes(`v${CSS_VERSION}`));
/** v48+: mail-proof grid, guide callouts on blog, hero traction (landing only). */
need("css size under 74KB", cssBytes < 74 * 1024);
need("body background scroll (no fixed jank)", css.includes("background-attachment: scroll"));
need("atmosphere contain strict", css.includes("contain: strict"));
need("interior atmosphere trim", css.includes("body:has(.pricing-page)"));
need("hero/wizard door scene off", css.includes("body:has(.wizard-steps) .spt-door-scene"));
need("wizard weather off", css.includes("body:has(.wizard-steps) .spt-weather"));
need("reduced motion hides door", css.includes(".spt-door-scene") && css.includes("prefers-reduced-motion"));
need("mobile locale bar no backdrop blur", /max-width: 1023px[\s\S]*\.locale-bar[\s\S]*backdrop-filter: none/.test(css));
need("fonts display=swap in brand", read("lib/brand-locale.mjs").includes("display=swap"));

const keyPages = ["index.html", "pricing.html", "app.html", "blog/index.html"];
for (const p of keyPages) {
  const h = read(p);
  need(`${p} css v${CSS_VERSION}`, h.includes(`simple-property.css?v=${CSS_VERSION}`));
  need(`${p} vercel insights defer`, h.includes('defer src="/_vercel/insights/script.js"'));
  if (h.includes("sp-entitlement.js")) {
    need(`${p} entitlement defer`, h.includes('sp-entitlement.js" defer'));
  }
  const blocking = h.match(/<script src="[^"]+"(?! defer)(?! async)[^>]*>/g) || [];
  const bad = blocking.filter((s) => !s.includes("_vercel") && !s.includes("type="));
  need(`${p} no sync blocking scripts`, bad.length === 0, bad.join("; "));
}

function walkHtml(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (n === "node_modules") continue;
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, acc);
    else if (n.endsWith(".html")) acc.push(p.slice(web.length + 1));
  }
  return acc;
}

let appLdDupes = 0;
const app = read("app.html");
appLdDupes = (app.match(/"@type"\s*:\s*"WebApplication"/g) || []).length;
need("app single WebApplication JSON-LD", appLdDupes === 1);

const jsFiles = ["sp-nav.js", "sp-checkout.js", "app.js"].map((f) => {
  const b = statSync(join(web, f)).size;
  console.log(`  ${f}: ${b} bytes`);
  return b;
});
need("app.js under 72KB", jsFiles[2] < 72 * 1024);

console.log(fail ? `\nPerformance audit FAILED (${fail})` : "\nPerformance audit OK");
process.exit(fail ? 1 : 0);
