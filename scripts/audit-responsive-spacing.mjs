#!/usr/bin/env node
/**
 * Phone + tablet spacing · sticky site header + locale bar chrome.
 * Breakpoints: phone ≤639px · tablet 640–1023 · desktop 1024+.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
const nav = readFileSync(join(web, "sp-nav.js"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("SPACING FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

need(`css v${CSS_VERSION}`, css.includes(`v${CSS_VERSION}`));
need("dual brand tag mobile/desktop", css.includes(".brand-tag__mobile") && css.includes(".brand-tag__desktop"));
need("phone hides long brand tag", css.includes("@media (max-width: 639px)") && css.includes(".brand-tag__desktop") && css.includes("display: none"));
need("tablet compact site-header", css.includes("@media (min-width: 640px) and (max-width: 1023px)") && css.includes(".site-header") && css.includes("var(--space-2)"));
need("phone compact site-header", css.includes("@media (max-width: 639px)") && css.includes(".brand-mark") && css.includes("width: 2rem"));
need("phone locale map-head hidden", css.includes("@media (max-width: 639px)") && css.includes(".locale-bar__map-head") && css.includes("display: none"));
need("tablet locale map-head hidden", css.includes("@media (min-width: 640px) and (max-width: 1023px)") && css.includes(".locale-bar__map-head") && css.includes("display: none"));
need("phone coverage chip compact", css.includes("--coverage-chip: 2.5rem"));
need("locale label short copy", nav.includes('"Your state"') && nav.includes('"Guides by state"'));
need("sticky locale bar", css.includes(".locale-bar") && css.includes("position: sticky"));
need("tablet spacing block present", css.includes("@media (min-width: 640px) and (max-width: 1023px)"));

console.log(fail ? `\nResponsive spacing audit FAILED (${fail})` : "\nResponsive spacing audit OK");
process.exit(fail ? 1 : 0);
