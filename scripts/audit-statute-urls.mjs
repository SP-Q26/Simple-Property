#!/usr/bin/env node
/** Every shipped state pack has an https statute URL aligned with deposit-rules cite. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES, STATE_PACKS } from "../web/lib/deposit-rules.mjs";
import { STATUTE_URLS } from "../web/lib/statute-urls.mjs";
import { localeNavEntries } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const nav = readFileSync(join(web, "sp-nav.js"), "utf8");

let fail = 0;
function need(label, ok) {
  if (!ok) {
    console.error("FAIL", label);
    fail++;
  } else console.log("OK", label);
}

for (const code of SUPPORTED_STATES) {
  const url = STATUTE_URLS[code];
  need(`${code} statute URL https`, typeof url === "string" && url.startsWith("https://"));
  need(`${code} cite in pack`, Boolean(STATE_PACKS[code].cite));
}

need("localeNavEntries cite + statuteUrl", localeNavEntries().every((e) => e.cite && e.statuteUrl));
need("sp-nav modifier statute hint", nav.includes("statuteUrl") && nav.includes("metaKey"));
need("sp-nav sr statute link", nav.includes("noopener noreferrer"));

console.log(fail ? `Statute URLs audit FAILED (${fail})` : "Statute URLs audit OK");
process.exit(fail ? 1 : 0);
