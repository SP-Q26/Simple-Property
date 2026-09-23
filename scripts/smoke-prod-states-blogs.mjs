#!/usr/bin/env node
/** Live smoke · every wizard state in /app + primary pain blog per state. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES, STATE_PACKS } from "../web/lib/deposit-rules.mjs";

const BASE = (process.env.SPT_SMOKE_URL || "https://simple-property.com").replace(/\/$/, "");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "web", "data", "blog-manifest.json"), "utf8"));

let fail = 0;

function primaryPainSlug(code) {
  const mapped = manifest.primaryPainByState?.[code];
  if (mapped) return mapped;
  const pains = manifest.posts.filter(
    (p) => Array.isArray(p.states) && p.states.includes(code) && (p.intent === "pain" || p.category === "pain")
  );
  return pains[0]?.slug;
}

async function get(path) {
  const url = BASE + path;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { res, text, url };
}

console.log("States + blogs smoke base:", BASE);

const rules = await get("/lib/deposit-rules.mjs");
console.log(`HTTP ${rules.res.status} /lib/deposit-rules.mjs`);
if (rules.res.status !== 200) {
  console.error("  FAIL deposit-rules module");
  fail++;
} else {
  const shipped = [...rules.text.matchAll(/^\s{2}([A-Z]{2}):\s*\{/gm)].map((x) => x[1]);
  if (!shipped.length) {
    console.error("  FAIL could not parse STATE_PACKS keys");
    fail++;
  } else {
    for (const code of SUPPORTED_STATES) {
      if (!shipped.includes(code)) {
        console.error(`  FAIL rules missing ${code}`);
        fail++;
      } else {
        const days = STATE_PACKS[code]?.returnDays;
        console.log(`  ok rules ${code} · ${days}-day pack`);
      }
    }
  }
}

const appJs = await get("/app.js");
console.log(`HTTP ${appJs.res.status} /app.js (wizard bundle)`);
if (appJs.res.status !== 200 || !appJs.text.includes("prop-state")) {
  console.error("  FAIL app.js wizard");
  fail++;
} else console.log("  ok app.js loads wizard");

const blogIndex = await get("/blog");
console.log(`HTTP ${blogIndex.res.status} /blog (locale clusters)`);
if (blogIndex.res.status !== 200) {
  fail++;
} else {
  for (const code of SUPPORTED_STATES) {
    const anchor = `id="locale-${code}"`;
    if (!blogIndex.text.includes(anchor)) {
      console.error(`  FAIL missing cluster ${anchor}`);
      fail++;
    } else console.log(`  ok cluster ${code}`);
  }
}

console.log("── Primary pain post per state ──");
for (const code of SUPPORTED_STATES) {
  const slug = primaryPainSlug(code);
  if (!slug) {
    console.error(`  FAIL ${code}: no pain slug in manifest`);
    fail++;
    continue;
  }
  const { res, text } = await get(`/blog/${slug}`);
  console.log(`HTTP ${res.status} ${code} pain · /blog/${slug}`);
  if (res.status !== 200) {
    fail++;
    continue;
  }
  if (!text.includes("Not legal advice") && !text.includes("not legal advice")) {
    console.error("  FAIL missing disclaimer");
    fail++;
  } else if (!text.includes('rel="canonical"')) {
    console.error("  FAIL missing canonical");
    fail++;
  } else console.log("  ok pain article");
}

if (fail) {
  console.error(`\nStates + blogs smoke FAILED (${fail})`);
  process.exit(1);
}
console.log("\nStates + blogs smoke OK");
process.exit(0);
