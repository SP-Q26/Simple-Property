#!/usr/bin/env node
/**
 * Regional expansion gate · Tier A Oct 2026 + metros.
 * Regions map to subagent audit lanes (content + statute links + wizard).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES, STATE_PACKS } from "../web/lib/deposit-rules.mjs";
import { STATUTE_URLS } from "../web/lib/statute-urls.mjs";
import { CITY_PRESETS } from "../web/lib/city-overlays.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));
const statutesHtml = readFileSync(join(web, "legal", "deposit-statutes.html"), "utf8");

const REGIONS = {
  pacific: ["CA", "HI", "WA"],
  mountain: ["CO", "UT", "NV", "AZ"],
  midwest: ["MN", "IA", "NE", "SD", "WI"],
  south: ["AR", "LA", "MS", "FL", "GA", "KY", "NC"],
  northeast: ["CT", "DE", "RI", "NH", "NJ", "VT", "MA"],
  midatlantic: ["MD", "VA", "WV", "DC", "PA"],
};

const TIER_A_NEW = new Set(["AR", "CA", "CO", "CT", "DE", "HI", "KY", "MN", "NE", "RI", "SD", "VT", "WV"]);
const METRO_PRESETS = new Set([
  "tampa-fl",
  "orlando-fl",
  "jacksonville-fl",
  "atlanta-ga",
  "richmond-va",
  "northern-virginia-va",
  "baltimore-md",
  "salt-lake-city-ut",
  "new-orleans-la",
  "seattle-wa",
  "las-vegas-nv",
]);

let fail = 0;
function need(label, ok) {
  if (!ok) {
    console.error("REGION FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function postsFor(code) {
  return manifest.posts.filter((p) => Array.isArray(p.states) && p.states.includes(code));
}

for (const code of TIER_A_NEW) {
  need(`wizard ${code}`, SUPPORTED_STATES.includes(code) && STATE_PACKS[code]);
  need(`${code} statute url`, STATUTE_URLS[code]?.startsWith("https://"));
  need(`${code} statute index row`, statutesHtml.includes(STATUTE_URLS[code]));
  const list = postsFor(code);
  need(`${code} blog depth ≥4`, list.length >= 4);
  need(`${code} primary pain`, Boolean(manifest.primaryPainByState?.[code]));
}

need("NC extendedReturnDays", STATE_PACKS.NC?.extendedReturnDays === 60);
need("CO extendedReturnDays", STATE_PACKS.CO?.extendedReturnDays === 60);

for (const id of METRO_PRESETS) {
  const preset = CITY_PRESETS.find((c) => c.id === id);
  need(`metro preset ${id}`, Boolean(preset?.blogSlug));
  const slug = preset?.blogSlug;
  need(`metro blog ${slug}`, manifest.posts.some((p) => p.slug === slug));
  need(`metro html ${slug}`, existsSync(join(web, "blog", `${slug}.html`)));
}

for (const [region, codes] of Object.entries(REGIONS)) {
  const shipped = codes.filter((c) => SUPPORTED_STATES.includes(c));
  const missingStatute = shipped.filter((c) => !statutesHtml.includes(STATUTE_URLS[c]));
  need(`region ${region} statute links`, missingStatute.length === 0);
  console.log(`  ${region}: ${shipped.length}/${codes.length} wizard codes`);
}

console.log(fail ? `Region expansion audit FAILED (${fail})` : "Region expansion audit OK");
process.exit(fail ? 1 : 0);
