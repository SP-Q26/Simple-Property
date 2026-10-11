#!/usr/bin/env node
/** Greystone door arrival · static audit */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
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

for (const r of [
  "spt-door-arrival-lottie.js",
  "spt-door-arrival.css",
  "lottie/spt-door-arrival-lottie.json",
  "lottie/spt-door-arrival-fallback.svg",
]) {
  need(r);
}

const js = need("spt-door-arrival-lottie.js");
if (!js.includes("spt-door-arrival-lottie.json")) fail++;

const css = need("spt-door-arrival.css");
if (!css.includes("sptDoorThrough")) fail++;

for (const page of ["index.html", "app.html"]) {
  const html = need(page);
  if (!html.includes("spt-door-arrival")) fail++;
}

if (fail) process.exit(1);
console.log("OK door arrival audit (Simple Property)");
