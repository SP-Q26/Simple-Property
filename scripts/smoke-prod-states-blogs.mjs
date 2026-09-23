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

const app = await get("/app");
console.log(`HTTP ${app.res.status} /app (wizard states)`);
if (app.res.status !== 200) {
  console.error("  FAIL app status");
  fail++;
} else {
  for (const code of SUPPORTED_STATES) {
    const opt = `value="${code}"`;
    if (!app.text.includes(opt)) {
      console.error(`  FAIL missing select option ${code}`);
      fail++;
    } else {
      const days = STATE_PACKS[code]?.returnDays;
      console.log(`  ok state ${code} · ${days}-day pack`);
    }
  }
}

const blogIndex = await get("/blog");
console.log(`HTTP ${blogIndex.res.status} /blog (locale clusters)`);
if (blogIndex.res.status !== 200) {
  fail++;
} else {
  for (const code of SUPPORTED_STATES) {
    const anchor = `#locale-${code}`;
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
