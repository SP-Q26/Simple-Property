#!/usr/bin/env node
/** Trust · simple · problem/solution voice on core surfaces (not legal advice). */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_TAGLINE } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("TRUST VOICE FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const index = readFileSync(join(web, "index.html"), "utf8");
const pricing = readFileSync(join(web, "pricing.html"), "utf8");
const css = readFileSync(join(web, "simple-property.css"), "utf8");

need("tagline on home", index.includes(BRAND_TAGLINE));
need("home problem/solution lead", index.includes("ps-problem") && index.includes("ps-fix"));
need(
  "home trust signal",
  (index.includes("court-record-card") && index.includes("hero-rotate")) || index.includes("hero-clock-gloss")
);
need("home mission outcome oriented", /Avoid penalties|Never pay the fees/i.test(index));
need("home disclaimer visible", index.includes("not legal advice"));
need("home honest limits FAQ", index.includes("Honest limits"));
need("pricing pain solution", pricing.includes("ps-problem") || pricing.includes("pain-solution"));
need("css court warning tokens", css.includes("--court-warning-ink"));
need("no homestead legacy", !index.includes("Homestead") && !pricing.includes("Homestead"));
need("no scareware tone", !/virus detected|act now or lose/i.test(index));

const forbiddenHype = ["guaranteed win", "sue your tenant", "crush", "destroy"];
for (const term of forbiddenHype) {
  need(`home no hype: ${term}`, !index.toLowerCase().includes(term));
}

console.log(fail ? `Trust voice audit FAILED (${fail})` : "Trust voice audit OK");
process.exit(fail ? 1 : 0);
