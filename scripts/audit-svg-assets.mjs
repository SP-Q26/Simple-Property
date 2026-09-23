#!/usr/bin/env node
/** SVG well-formedness + brand asset gates (Stripe + OG + favicon). */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

const REQUIRED = [
  "favicon.svg",
  "og/spt-card.svg",
  "stripe/pro-monthly.svg",
  "stripe/pro-annual.svg",
  "stripe/turn-move-out.svg",
  "stripe/turn-full.svg",
];

const FORBIDDEN = [
  "\u2014", // em dash
  "\u2013", // en dash in copy (use hyphen in SVG text)
  "\ufffd",
  "\u0000",
];

function need(label, ok) {
  if (!ok) {
    console.error("SVG FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

for (const rel of REQUIRED) {
  const p = join(web, rel);
  const svg = readFileSync(p, "utf8");
  need(`${rel} exists`, svg.length > 80);
  need(`${rel} xmlns`, svg.includes('xmlns="http://www.w3.org/2000/svg"'));
  need(`${rel} aria-label`, /aria-label="[^"]+"/.test(svg));
  need(`${rel} viewBox or width`, svg.includes("viewBox"));
  for (const bad of FORBIDDEN) {
    if (svg.includes(bad)) need(`${rel} no forbidden char`, false);
  }
  const xml = spawnSync("xmllint", ["--noout", p], { encoding: "utf8" });
  need(`${rel} xmllint`, xml.status === 0);
  if (xml.status !== 0 && xml.stderr) console.error(xml.stderr.trim());
}

const stripeDir = join(web, "stripe");
for (const f of readdirSync(stripeDir).filter((x) => x.endsWith(".png"))) {
  const kb = Math.round(statSync(join(stripeDir, f)).size / 1024);
  need(`${f} png present (${kb} KB)`, kb > 1 && kb < 512);
}

const uploadDir = join(root, "docs/stripe/upload-for-stripe");
for (const f of readdirSync(stripeDir).filter((x) => x.endsWith(".png"))) {
  const up = join(uploadDir, f);
  need(`upload-for-stripe/${f}`, existsSync(up));
}

const favicon = readFileSync(join(web, "favicon.svg"), "utf8");
need("favicon door hinges", favicon.includes("door-hinge"));
need("favicon rim lock plate", favicon.includes("door-rim-lock"));
need("favicon no padlock arch", !favicon.includes('d="M26-8V-20'));
const og = readFileSync(join(web, "og/spt-card.svg"), "utf8");
need("OG coverage chips on card", (og.match(/class="coverage-chip"/g) || []).length === SUPPORTED_STATES.length);
need("OG card 18 states copy", og.includes("18 states + DC"));

const monthly = readFileSync(join(web, "stripe/pro-monthly.svg"), "utf8");
need("monthly cascade", (monthly.match(/scale\(/g) || []).length >= 3);
const annual = readFileSync(join(web, "stripe/pro-annual.svg"), "utf8");
need("annual year ring", annual.includes('r="108"'));
const moveOut = readFileSync(join(web, "stripe/turn-move-out.svg"), "utf8");
need("move-out swing door", moveOut.includes("l36 28") || moveOut.includes("L36 28"));
const full = readFileSync(join(web, "stripe/turn-full.svg"), "utf8");
need("full tenancy two doors", full.includes("translate(-72") && full.includes("#7a4038"));

console.log(fail ? `\nSVG audit FAILED (${fail})` : "\nSVG audit OK");
process.exit(fail ? 1 : 0);
