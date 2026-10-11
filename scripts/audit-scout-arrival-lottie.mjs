#!/usr/bin/env node
/** Scout arrival Lottie · static audit */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEB = join(ROOT, "web");
let fail = 0;

function need(rel) {
  const p = join(WEB, rel);
  if (!existsSync(p)) {
    console.error("P0 MISSING", rel);
    fail++;
    return "";
  }
  return readFileSync(p, "utf8");
}

const required = [
  "spt-scout-arrival-lottie.js",
  "spt-scout-arrival.css",
  "lottie/spt-scout-arrival-lottie.json",
  "lottie/spt-scout-arrival-fallback.svg",
];

for (const r of required) need(r);

const js = need("spt-scout-arrival-lottie.js");
if (!js.includes("spt-scout-arrival-lottie.json")) {
  console.error("P0 boot must load lottie json");
  fail++;
}

const css = need("spt-scout-arrival.css");
if (!css.includes("sptScoutThrough")) {
  console.error("P0 missing through keyframes");
  fail++;
}

for (const page of ["index.html", "app.html"]) {
  const html = need(page);
  if (!html.includes("spt-scout-arrival.css")) {
    console.error("P0", page, "missing scout arrival css");
    fail++;
  }
  if (!html.includes("spt-scout-arrival-lottie.js")) {
    console.error("P0", page, "missing scout arrival script");
    fail++;
  }
}

try {
  const json = JSON.parse(readFileSync(join(WEB, "lottie/spt-scout-arrival-lottie.json"), "utf8"));
  if (json.fr !== 30 || json.op < 40) {
    console.error("P0 bad lottie fr/op");
    fail++;
  }
} catch {
  console.error("P0 invalid lottie json");
  fail++;
}

if (fail) {
  console.error("FAIL scout arrival audit", fail);
  process.exit(1);
}
console.log("OK scout arrival audit");
