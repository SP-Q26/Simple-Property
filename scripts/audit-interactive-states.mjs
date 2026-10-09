#!/usr/bin/env node
/** Hover, tap, and focus-visible on primary customer controls (coverage bar + nav). */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("INTERACTIVE FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function blockHas(selector, ...needles) {
  const i = css.indexOf(selector);
  if (i < 0) return false;
  const slice = css.slice(i, i + 900);
  return needles.every((n) => slice.includes(n));
}

need("coverage strip box padding", css.includes(".coverage-bubbles--strip") && css.includes("padding: var(--space-3)"));
need("coverage bubble hover", css.includes(".coverage-bubble:hover"));
need("coverage bubble active", css.includes(".coverage-bubble:active"));
need("coverage bubble focus", css.includes(".coverage-bubble:focus-visible"));
need("coverage bubble transition", blockHas(".coverage-bubble {", "transition:"));

need("metro link hover", css.includes(".metro-nav__link:hover"));
need("metro link active", css.includes(".metro-nav__link:active"));
need("metro link focus", css.includes(".metro-nav__link:focus-visible"));
need("metro link tap min", blockHas(".metro-nav__link {", "min-height: var(--tap-min)"));

need("pathway hover+active+focus", css.includes(".pathway-card:hover") && css.includes(".pathway-card:active") && css.includes(".pathway-card:focus-visible"));
need("guide pills hover+active+focus", css.includes(".guides-hub .guide-pills a:hover") && css.includes(".guides-hub .guide-pills a:active") && css.includes(".guides-hub .guide-pills a:focus-visible"));
need("btn hover+active+focus", css.includes(".btn:active") && css.includes(".btn:focus-visible"));
need("header nav hover", css.includes(".header-nav a:hover"));
need("faq door summary tap", css.includes(".faq-door summary:hover") && css.includes(".faq-door summary:focus-visible"));
need("court record rotate motion", css.includes("court-record-in") && css.includes("prefers-reduced-motion"));
need("statute index link hover", css.includes(".locale-bar__statute-index a:hover"));

need("coverage spotlight padding", blockHas(".coverage-spotlight {", "padding: var(--space-6)"));

console.log(fail ? `\nInteractive states audit FAILED (${fail})` : "\nInteractive states audit OK");
process.exit(fail ? 1 : 0);
