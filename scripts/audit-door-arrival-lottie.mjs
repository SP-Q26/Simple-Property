#!/usr/bin/env node
/** Greystone door arrival · static audit */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  HOLD_MS,
  FLOOR_MS,
  WALL_MS,
  ARRIVAL_CHROME_VER,
  LOTTIE_FR,
  LOTTIE_OP,
} from "./lib/door-arrival-canon.mjs";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("DOOR ARRIVAL FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function needFile(rel) {
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
  "vendor/dotlottie-player.mjs",
  "lottie/spt-door-arrival-lottie.json",
  "lottie/spt-door-arrival-fallback.svg",
]) {
  needFile(r);
}

const js = needFile("spt-door-arrival-lottie.js");
need("no unpkg player", !js.includes("unpkg.com"));
need("self-hosted player", js.includes("/vendor/dotlottie-player.mjs"));
need("JS HOLD_MS", js.includes("var HOLD_MS = " + HOLD_MS));
need("JS FLOOR_MS", js.includes("var FLOOR_MS = " + FLOOR_MS));
need("JS WALL_MS", js.includes("var WALL_MS = " + WALL_MS));
need("JS scroll lock", js.includes("spt-door-arrival-lock"));
need("player loop false", js.includes('"loop", "false"'));
need("HTML SP monogram overlay", js.includes("spt-door-arrival__monogram"));
need("monogram SP text", js.includes('textContent = "SP"'));

const css = needFile("spt-door-arrival.css");
need("through-motion keyframes", css.includes("sptDoorThrough"));
need("scroll lock rule", css.includes("spt-door-arrival-lock"));
need("monogram CSS", css.includes("spt-door-arrival__monogram"));

const fallback = needFile("lottie/spt-door-arrival-fallback.svg");
need("fallback SP text", fallback.includes(">SP<"));
need("fallback steel door", fallback.includes("#4a5058") || fallback.includes("#5a6169"));

const json = JSON.parse(needFile("lottie/spt-door-arrival-lottie.json"));
const durMs = Math.round((json.op / json.fr) * 1000);
need("lottie fr/op canon", json.fr === LOTTIE_FR && json.op === LOTTIE_OP);
need("lottie duration = wall", durMs === WALL_MS);

const ver = String(ARRIVAL_CHROME_VER);
for (const page of ["index.html", "app.html"]) {
  const html = needFile(page);
  need(`${page} door chrome v${ver}`, html.includes(`spt-door-arrival.css?v=${ver}`));
  need(`${page} lottie preload`, html.includes("/lottie/spt-door-arrival-lottie.json"));
}

if (fail) process.exit(1);
console.log("OK door arrival audit (Simple Property)");
