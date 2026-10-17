#!/usr/bin/env node
/**
 * Extreme mobile audit · layout order · touch flow · spacing · type scale (≤639px canon).
 * Complements audit-mobile-responsive, audit-ios-brand-spacing, audit-site-spacing-breakpoints.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("MOBILE EXTREME FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

function orderBefore(html, a, b) {
  const i = html.indexOf(a);
  const j = html.indexOf(b);
  return i >= 0 && j >= 0 && i < j;
}

const CORE = [
  "index.html",
  "pricing.html",
  "app.html",
  "hub.html",
  "launch-stack.html",
  "modules.html",
  "logs.html",
  "feedback.html",
  "blog/index.html",
];

for (const rel of CORE) {
  const h = read(rel);
  need(`${rel} viewport-fit`, h.includes("viewport-fit=cover"));
  need(`${rel} css v${CSS_VERSION}`, h.includes(`simple-property.css?v=${CSS_VERSION}`));
}

need(`css header v${CSS_VERSION}`, css.includes(`v${CSS_VERSION}`));
need("mobile phone block @639", css.includes("@media (max-width: 639px)"));
need("body base font 17px", css.includes("font-size: 1.0625rem"));
need("mobile hero h1 clamp", css.includes("clamp(1.45rem, 6.5vw, 1.85rem)"));
need("mobile hero actions column", css.includes(".hero-actions") && css.includes("flex-direction: column"));
need("mobile hero copy gap reset", css.includes(".hero-copy > .value-roi-line"));
need("mobile lane hint type", css.includes(".automation-lane-line") && css.includes("line-height: 1.45"));
need("mobile solution stack rhythm", css.includes(".solution-stack") && css.includes("margin: var(--space-5)"));
need("mobile pricing stack padding", css.includes(".pricing-stack") && css.includes("padding: var(--space-4)"));
need("mobile stack compare scroll", css.includes(".stack-compare-table") && css.includes("overflow-x: auto"));
need("mobile tier table scroll", css.includes(".tier-table") && css.includes("overflow-x: auto"));
need("mobile wizard steps horizontal scroll", css.includes(".wizard-steps") && css.includes("overflow-x: auto"));
need("mobile wizard nav column", css.includes(".wizard-nav") && css.includes("flex-direction: column"));
need("mobile wizard nav actions column", css.includes(".wizard-nav__actions") && css.includes("flex-direction: column"));
need("mobile packet bar stack", css.includes(".packet-bar") && css.includes("flex-direction: column"));
need("mobile hub wizard actions stack", css.includes(".hub-wizard-actions") && css.includes("flex-direction: column"));
need("mobile form flow rail size", css.includes(".form-flow-rail") && css.includes("font-size: 0.8125rem"));
need("mobile ps copy readable", css.includes(".ps-problem") && css.includes("line-height: 1.5"));
need("sticky wizard safe bottom", css.includes(".wizard-nav--sticky") && css.includes("safe-bottom"));

const index = read("index.html");
need("home hero copy before proof", orderBefore(index, 'class="hero-copy"', 'class="hero-proof"'));
need("home pathway before solution stack", orderBefore(index, "pathway-deck", "solution-stack"));
need("home solution stack before guides", orderBefore(index, "solution-stack", "guides-hub"));
need("home primary CTA in hero actions", index.includes('class="btn btn-primary"') && index.includes("hero-actions"));

const pricing = read("pricing.html");
need("pricing mission before finder", orderBefore(pricing, "pricing-mission", "pricing-finder"));
need("pricing cards before stack compare", orderBefore(pricing, "pricing-cards", "pricing-stack"));
need("pricing stack compare table", pricing.includes("stack-compare-table"));

const app = read("app.html");
need("app intro before packet bar", orderBefore(app, "app-intro", "packet-bar"));
need("app progress before steps", orderBefore(app, "wizard-progress", "wizard-steps"));
need("app panel before sticky nav", orderBefore(app, 'id="wizard-panel"', "wizard-nav--sticky"));
need("app sticky nav class", app.includes("wizard-nav--sticky"));

const hub = read("hub.html");
need("hub intro before mount", orderBefore(hub, "hub-static-intro", "hub-root"));

const appJs = read("app.js");
need("app mobile photo guard", /400\s*KB|400KB|photo.*size/i.test(appJs));

console.log(fail ? `\nMobile extreme audit FAILED (${fail})` : "\nMobile extreme audit OK");
process.exit(fail ? 1 : 0);
