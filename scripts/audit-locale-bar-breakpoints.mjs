#!/usr/bin/env node
/**
 * Locale color bar · sizing + spacing at mobile / tablet / desktop breakpoints.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION, PACK_COUNT } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
const nav = readFileSync(join(web, "sp-nav.js"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("LOCALE BAR FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

need(`css v${CSS_VERSION} header`, css.includes(`v${CSS_VERSION}`));
need("19 state packs in nav", (nav.match(/"code":/g) || []).length === PACK_COUNT);
need("nav no wrong color line", !/Wrong color\s*=/.test(nav));
need("nav tap your state legend", nav.includes("Tap your state"));

need("mobile max639 tap-min chips", css.includes("@media (max-width: 639px)") && css.includes(".coverage-bubble") && css.includes("--coverage-chip: var(--tap-min)"));
need("mobile locale label full width", css.includes(".locale-bar__label") && css.includes("flex: 1 1 100%"));
need("mobile map wrap full width", css.includes(".locale-bar__map-wrap") && css.includes("max-width: none"));

need("tablet 640-1023 locale scroll", css.includes("@media (min-width: 640px) and (max-width: 1023px)") && css.includes(".coverage-bubbles__track") && css.includes("overflow-x: auto"));
need("tablet locale chip size", css.includes("--coverage-chip: 1.75rem"));

need("desktop 640 locale map flex", css.includes("@media (min-width: 640px)") && css.includes(".locale-bar__map-wrap") && css.includes("min-width: 0"));
need("desktop 900 track wrap", css.includes("@media (min-width: 900px)") && css.includes("flex-wrap: wrap") && css.includes(".coverage-bubbles__track"));
need("desktop 1024 locale spacing", css.includes("@media (min-width: 1024px)") && css.includes(".locale-bar"));

need("kicker hidden", css.includes(".locale-bar__kicker") && css.includes("display: none"));
need("strip track scroll snap mobile default", css.includes("scroll-snap-type") && css.includes(".coverage-bubbles__track"));
need("legend compact font", css.includes(".coverage-map__legend") && css.includes("0.5625rem"));

console.log(fail ? `\nLocale bar breakpoint audit FAILED (${fail})` : "\nLocale bar breakpoint audit OK");
process.exit(fail ? 1 : 0);
