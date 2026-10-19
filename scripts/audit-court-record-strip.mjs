#!/usr/bin/env node
/** Home court-record strip · fixed stage · rail / line / footer order · breakpoints. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const index = readFileSync(join(web, "index.html"), "utf8");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
const rotate = readFileSync(join(web, "court-record-rotate.js"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("COURT STRIP FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function orderBefore(a, b) {
  const i = index.indexOf(a);
  const j = index.indexOf(b);
  return i >= 0 && j >= 0 && i < j;
}

need(`css v${CSS_VERSION}`, css.includes(`v${CSS_VERSION}`));
need("strip layout wrapper", index.includes("court-record-strip__layout"));
need("strip fixed stage", index.includes("court-record-strip__stage"));
need("strip rail label", index.includes("court-record-strip__rail-text"));
need("home clerk record kicker", index.includes("The court clerk record"));
need("rotate clerk record label", rotate.includes("The court clerk record") && rotate.includes("court clerk record"));
need("strip full-width line in stage", index.includes("court-record-strip__line"));
need("strip footer links", index.includes("court-record-strip__footer") && index.includes("data-spt-court-source"));
need("flow rail before stage", orderBefore("court-record-strip__rail", "court-record-strip__stage"));
need("flow line before footer in stage", orderBefore("court-record-strip__line", "court-record-strip__footer"));
need("flow strip before hero", orderBefore("court-record-strip", 'class="hero"'));
need("css fixed stage height", css.includes("--court-strip-stage-h") && css.includes(".court-record-strip__stage"));
need("css stage line clamp", css.includes(".court-record-strip__line") && css.includes("line-clamp"));
need("css footer end aligned", css.includes(".court-record-strip__footer") && css.includes("justify-self: end"));
need("css stacked rail above stage", css.includes(".court-record-strip__layout") && /\.court-record-strip__rail[\s\S]{0,220}flex-direction:\s*row/.test(css));
need("css strip hover class", css.includes(".court-record-card--strip.is-strip-hover"));
need("phone strip @639", css.includes("@media (max-width: 639px)") && css.includes(".court-record-strip__stage"));
need("tablet strip band 640-1023", css.includes("@media (min-width: 640px) and (max-width: 1023px)") && css.includes("--court-strip-stage-h"));
need("desktop strip band 1024", css.includes("@media (min-width: 1024px)") && css.includes(".court-record-strip__stage"));

need("rotate rail label target", rotate.includes("court-record-strip__rail-text"));
need(
  "strip card hover state",
  css.includes(".court-record-card.court-record-card--strip:hover") && css.includes("border-left-color")
);
const blogLine = css.indexOf(".hero-rotate-line {");
const tailOverride = css.indexOf(".court-record-card--strip .court-record-strip__line.hero-rotate-line");
need("cascade tail after blog line rule", blogLine >= 0 && tailOverride > blogLine);
need("cascade tail marker", css.includes("Court strip · cascade tail"));
need("strip line min-height zero tail", /court-record-strip__line\.hero-rotate-line[\s\S]{0,120}min-height:\s*0/.test(css));

console.log(fail ? `audit-court-record-strip FAILED (${fail})` : "audit-court-record-strip OK");
process.exit(fail ? 1 : 0);
