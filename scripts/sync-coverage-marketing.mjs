#!/usr/bin/env node
/** Sync 19 states + DC copy on gospel, terms, pricing meta, coverage thanks post. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATE_ONLY_COUNT } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const label = `${STATE_ONLY_COUNT} states + DC`;
const labelUs = `${STATE_ONLY_COUNT} US states plus the District of Columbia`;

const gospelPath = join(web, ".well-known/spt-gospel.json");
const gospel = JSON.parse(readFileSync(gospelPath, "utf8"));
gospel.lane.is = gospel.lane.is.replace(/\d+ US states \+ DC/g, `${STATE_ONLY_COUNT} US states + DC`);
if (!gospel.lane.is.includes(`${STATE_ONLY_COUNT} US states`)) {
  gospel.lane.is = `Security deposit move-in/move-out documentation for mom-and-pop landlords (${STATE_ONLY_COUNT} US states + DC · Chicago RLTO · up to 40 doors). Wizard default clocks: 30 or 45 calendar days from surrender where statute fits simple model.`;
}
writeFileSync(gospelPath, JSON.stringify(gospel, null, 2) + "\n");

let terms = readFileSync(join(web, "terms.html"), "utf8");
terms = terms.replace(/\d+ US states plus the District of Columbia/g, labelUs);
terms = terms.replace(/\d+ states \+ DC/g, label);
writeFileSync(join(web, "terms.html"), terms);

let pricing = readFileSync(join(web, "pricing.html"), "utf8");
pricing = pricing.replace(
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="Deposit mistakes beat tool cost. Free draft, $29/$49 per turn, Pro $22/mo or $99/yr · print packet · 40 units · ${label}.">`
);
writeFileSync(join(web, "pricing.html"), pricing);

const manifestPath = join(web, "data/blog-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
for (const p of manifest.posts) {
  if (p.slug !== "deposit-desk-new-states-thanks-sep-2026") continue;
  p.description = p.description.replace(/18 states \+ DC/g, label);
  if (p.ogImageAlt) p.ogImageAlt = p.ogImageAlt.replace(/18 states \+ DC/g, label);
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log("sync-coverage-marketing ·", label);
