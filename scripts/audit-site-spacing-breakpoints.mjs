#!/usr/bin/env node
/**
 * Site spacing at every customer breakpoint band:
 * phone ≤639 · tablet 640–1023 · hero split 820+ · desktop 1024+.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
const index = readFileSync(join(web, "index.html"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("SITE SPACING FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "node_modules" || name === "brand") continue;
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

need(`css v${CSS_VERSION}`, css.includes(`v${CSS_VERSION}`));
need("space scale tokens", /--space-1:/.test(css) && /--space-7:/.test(css));
need("safe-area tokens", css.includes("--safe-top") && css.includes("--safe-bottom"));

const bands = [
  ["phone", "@media (max-width: 639px)"],
  ["phone alt", "@media (max-width: 640px)"],
  ["tablet", "@media (min-width: 640px) and (max-width: 1023px)"],
  ["tablet up", "@media (min-width: 640px)"],
  ["hero split", "@media (min-width: 820px)"],
  ["desktop", "@media (min-width: 1024px)"],
];
for (const [label, mq] of bands) {
  need(`${label} block present`, css.includes(mq));
}

need("hero layout top-align", /\.hero-layout\s*\{[^}]*align-items:\s*start/.test(css));
need("hero copy stack", css.includes(".hero-copy") && css.includes("flex-direction: column"));
need("home hero-copy markup", index.includes('class="hero-copy"'));
need("hero copy zeroes child margins", css.includes(".hero-copy > .hero-mission"));
need("desktop hero padding rhythm", css.includes(".page > main .hero") && css.includes("padding: var(--space-6)"));

need("main section pathway rhythm", css.includes(".pathway-deck") && css.includes("margin:"));
need("pricing cards breakpoint ladder", css.includes("@media (min-width: 720px)") && css.includes("@media (min-width: 1024px)"));
need("wizard mobile stack block", css.includes("@media (max-width: 639px)") && css.includes(".hero-actions"));
need("page safe horizontal padding", css.includes("max(var(--space-3), var(--safe-right))"));

const pages = walkHtml(web).filter((p) => !p.includes("/api/"));
const sample = ["index.html", "pricing.html", "app.html", "blog/index.html", "feedback.html", "hub.html"];
for (const rel of sample) {
  const h = readFileSync(join(web, rel), "utf8");
  need(`${rel} versioned css v${CSS_VERSION}`, h.includes(`simple-property.css?v=${CSS_VERSION}`));
}

console.log(fail ? `\nSite spacing breakpoints FAILED (${fail})` : "\nSite spacing breakpoints audit OK");
process.exit(fail ? 1 : 0);
