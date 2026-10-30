#!/usr/bin/env node
/**
 * Site experience sweep · fonts · FAQ brand · forms · breakpoints · copy gates.
 * Complements audit-spt-web (run after FAQ/CSS changes).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION, FONT_GOOGLE } from "../web/lib/brand-locale.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("SITE FAIL:", label, detail || "");
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

console.log("── Site experience audit Oct 2026 ──\n");

const css = read("simple-property.css");
const index = read("index.html");
const feedback = read("feedback.html");
const app = read("app.html");

need(`css v${CSS_VERSION} header`, css.includes(`v${CSS_VERSION}`));
need("Source fonts in css vars", css.includes("--font-display") && css.includes("Source Sans"));
need("display=swap in brand locale", FONT_GOOGLE.includes("display=swap"));
need("index font preconnect", index.includes("fonts.googleapis.com") && index.includes("fonts.gstatic.com"));
need(`index css v${CSS_VERSION}`, index.includes(`simple-property.css?v=${CSS_VERSION}`));

need("FAQ section mark", index.includes("faq-section__mark") && index.includes("/favicon.svg"));
need("FAQ shell wrapper", index.includes("faq-doors-shell"));
need("FAQ single-column stack", css.includes(".faq-doors {") && css.includes("flex-direction: column"));
need("FAQ no skeuomorphic arch", !css.includes(".faq-door::before"));
need("FAQ scroll margin groups", css.includes(".faq-doors-group") && css.includes("scroll-margin-top"));

need("feedback form container", feedback.includes("spt-feedback-form") || feedback.includes("<form"));
need("feedback honeypot or spam gate", feedback.includes("feedback-honeypot") || feedback.includes("honeypot"));
need("app wizard steps", app.includes("wizard-steps") || app.includes("wizard-step"));

need("brand mark on shell pages", index.includes("brand-mark") && read("pricing.html").includes("brand-mark"));
need("footer contact product email", read("pricing.html").includes("hello@simple-property.com"));

need("tap min token", css.includes("--tap-min"));
need("mobile faq head stack", css.includes(".faq-section__head") && css.includes("@media (max-width: 639px)"));

need("pathway card transitions", css.includes("--ease-interactive"));
need("home defer paint", css.includes(".home-defer-paint"));

console.log(fail ? `\nSite experience audit FAILED (${fail})` : "\nSite experience audit OK");
process.exit(fail ? 1 : 0);
